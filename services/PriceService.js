const { ethers } = require('hardhat')
const axios = require('axios')
const { binanceEndpoint } = require('../constants/config')

const { routerABI, pairABI } = require('../constants/abi.js')

const Provider = require('./Provider.js')

class PriceService extends Provider {
    constructor() {
        super()
    }

    // get pair price from pair address
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

        //getting reserves
        const poolReserves = pairContractInstance.getReserves()

        //quotation with fees
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

    getAllPrices = async (pairs) => {
        let exchangesPrices = []
        let i = 0

        // price from DEX are calculated for trading 1 baseToken against
        // an unknown amount of quoteToken
        let amountBaseToken = '1'

        // external prices are taken from binance public api
        // values are matching the pairs.json pairs
        const { data } = await axios.get(binanceEndpoint)
        let externalPrices = [
            data[2].price,
            data[4].price,
            1 / data[1].price,
            data[3].price,
            1 / data[0].price,
        ]

        // here's the amount of quoteToken we get from selling 1 baseToken
        let amountQuoteToken = (
            Number(amountBaseToken) * externalPrices[i]
        ).toString()

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
                    amountBaseToken,
                    amountQuoteToken,
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

    isProfitable = async (allPrices) => {}

    getBiggestProfit = async (isProfitable) => {}
}

module.exports = PriceService
