const { ethers } = require('hardhat')
const axios = require('axios')
const fs = require('fs')
const combinations = require('lodash.combinations')
const _ = require('lodash')

const { binanceEndpoint } = require('../constants/config')
const { routerABI, pairABI } = require('../constants/abi.js')

const Provider = require('./Provider.js')

class PriceService extends Provider {
    constructor() {
        super()
    }

    getPairPrice = async (
        amountBaseToken,
        amountQuoteToken,
        baseTokenAddress,
        pairAddress,
        routerAddress
    ) => {
        const pairContractInstance = new ethers.Contract(
            pairAddress,
            pairABI,
            this.provider
        )
        const routerContractInstance = new ethers.Contract(
            routerAddress,
            routerABI,
            this.provider
        )

        const poolReserves = pairContractInstance.getReserves()

        let addressToken0 = pairContractInstance.token0()
        let addressToken1 = pairContractInstance.token1()

        let [fromPoolReserves, fromToken0, fromToken1] =
            await Promise.allSettled([
                poolReserves,
                addressToken0,
                addressToken1,
            ])

        addressToken0 = fromToken0.value
        addressToken1 = fromToken1.value

        const token0 = Number(
            ethers.utils.formatEther(fromPoolReserves.value[0])
        )
        const token1 = Number(
            ethers.utils.formatEther(fromPoolReserves.value[1])
        )

        let pairPrice, pathSell, pathBuy
        if (baseTokenAddress !== addressToken0) {
            pairPrice = token0 / token1
            pathSell = [addressToken1, addressToken0]
            pathBuy = [addressToken0, addressToken1]
        } else {
            pairPrice = token1 / token0
            pathSell = [addressToken0, addressToken1]
            pathBuy = [addressToken1, addressToken0]
        }

        // selling amountIn of baseToken (token0) for amountOut (unknown) of quoteToken (token1)
        let pairPriceArraySell = routerContractInstance.getAmountsOut(
            ethers.utils.parseUnits(amountBaseToken, 18),
            pathSell
        )

        // buying amountIn (unknown) of baseToken (token0) with amountInQuoteToken of quoteToken (token1)
        let pairPriceArrayBuy = routerContractInstance.getAmountsOut(
            ethers.utils.parseUnits(amountQuoteToken, 18),
            pathBuy
        )

        let [sell, buy] = await Promise.allSettled([
            pairPriceArraySell,
            pairPriceArrayBuy,
        ])

        return {
            sell:
                Number(ethers.utils.formatEther(sell.value[1])) /
                Number(ethers.utils.formatEther(sell.value[0])),
            reserve: pairPrice,
            buy:
                Number(ethers.utils.formatEther(buy.value[0])) /
                Number(ethers.utils.formatEther(buy.value[1])),
        }
    }

    getAllPrices = async (pairs, amountBaseToken) => {
        let exchangesPrices = []
        let i = 0

        // external prices are taken from binance public api
        // values are matching the pairs.json pairs
        const { data } = await axios.get(binanceEndpoint)
        let externalPrices = [
            Number(data[2].price),
            Number(data[4].price),
            Number(1 / data[1].price),
            Number(data[3].price),
            Number(1 / data[0].price),
        ]

        // here's the amount of quoteToken we get from selling X amount of baseToken
        let amountBaseTokenConverted = amountBaseToken.map((string) =>
            Number(string)
        )
        let amountQuoteToken = []

        for (let i = 0; i < externalPrices.length; i++) {
            amountQuoteToken[i] = (
                amountBaseTokenConverted[i] * externalPrices[i]
            ).toString()
        }

        for (const pair of pairs) {
            const symbols = pair.symbols
            const baseToken = pair.baseToken
            const quoteToken = pair.quoteToken

            exchangesPrices[i] = {
                symbols,
                truePrice: externalPrices[i],
                baseToken,
                quoteToken,
            }
            exchangesPrices[i]['pairs'] = []

            for (const singleExchangePair of pair.pairs) {
                const exchangeName = singleExchangePair.exchange.name

                let prices = await this.getPairPrice(
                    amountBaseToken[i],
                    amountQuoteToken[i],
                    pair.baseToken.address,
                    singleExchangePair.address,
                    singleExchangePair.exchange.routerAddress
                )

                exchangesPrices[i]['pairs'].push({
                    ...singleExchangePair,
                    prices,
                })
            }
            i++
        }

        return exchangesPrices
    }

    getGasPrice = async () => {
        return ethers.utils.formatUnits(await this.provider.getGasPrice())
    }

    combineDEXtrades = (allPrices) => {
        for (let i = 0; i < allPrices.length; i++) {
            let pair = allPrices[i]
            allPrices[i].pairs = _.combinations(pair.pairs, 2)
        }

        return allPrices
    }

    computeProfit = (allPricesComb) => {
        for (let i = 0; i < allPricesComb.length; i++) {
            let pair = allPricesComb[i]
            let pricesDEXComb = pair.pairs

            let profitComputation = []
            for (let j = 0; j < pricesDEXComb.length; j++) {
                let result = {}
                let dualDEXtrade = pricesDEXComb[j]

                //trades are only between two DEXs
                let DEX1 = dualDEXtrade[0]
                let DEX2 = dualDEXtrade[1]

                //buy on DEX2 and sell on DEX1
                let profitDir1 = DEX1.prices.sell - DEX2.prices.buy
                let addressBuy = DEX2.address
                let exchangeBuy = DEX2.exchange
                let addressSell = DEX1.address
                let exchangeSell = DEX1.exchange
                result['direction1'] = {
                    direction: [
                        { addressBuy, exchangeBuy },
                        { addressSell, exchangeSell },
                    ],
                    profit: profitDir1,
                }
                if (profitDir1 > 0) {
                    console.log('Date now -------- ', Date.now())
                    console.log(
                        `BUY ${pair.baseToken.symbol} on ${result['direction1'].direction[0].exchangeBuy.name} and SELL ${pair.quoteToken.symbol} on ${result['direction1'].direction[1].exchangeSell.name}`
                    )
                    console.log('The profit -------- ', profitDir1)
                }

                //buy on DEX1 and sell on DEX2
                let profitDir2 = DEX2.prices.sell - DEX1.prices.buy
                addressBuy = DEX1.address
                exchangeBuy = DEX1.exchange
                addressSell = DEX2.address
                exchangeSell = DEX2.exchange
                result['direction2'] = {
                    direction: [
                        { addressBuy, exchangeBuy },
                        { addressSell, exchangeSell },
                    ],
                    profit: profitDir2,
                }
                if (profitDir2 > 0) {
                    console.log('Date now --------', Date.now())
                    console.log(
                        `BUY ${pair.baseToken.symbol} on ${result['direction2'].direction[0].exchangeBuy.name} and SELL ${pair.quoteToken.symbol} on ${result['direction2'].direction[1].exchangeSell.name}`
                    )
                    console.log('The profit -------- ', profitDir2)
                }

                profitComputation.push(result)
            }
            allPricesComb[i].pairs = profitComputation
        }

        return allPricesComb
    }

    isProfitable = () => {}

    getBiggestProfit = async (isProfitable) => {}
}

module.exports = PriceService
