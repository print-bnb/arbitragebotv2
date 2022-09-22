const { ethers } = require('ethers')
const fs = require('fs')
const combinations = require('lodash.combinations')
const _ = require('lodash')
const mailgun = require('mailgun-js')({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
})

const { routerABI, pairABI } = require('../constants/abi.js')

const BlockchainService = require('./BlockchainService.js')

class PriceService extends BlockchainService {
    constructor() {
        super()
    }

    getPairPrice = async (
        amountBaseToken,
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

        let promisesValue1
        try {
            promisesValue1 = await Promise.allSettled([
                poolReserves,
                addressToken0,
                addressToken1,
            ])
        } catch (error) {
            console.log(error)
        }

        let fromPoolReserves = promisesValue1[0]
        let fromToken0 = promisesValue1[1]
        let fromToken1 = promisesValue1[2]

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
        let pairPriceArrayBuy = routerContractInstance.getAmountsIn(
            ethers.utils.parseUnits(amountBaseToken, 18),
            pathBuy
        )

        let promisesValue2
        try {
            promisesValue2 = await Promise.allSettled([
                pairPriceArraySell,
                pairPriceArrayBuy,
            ])
        } catch (error) {
            console.log(error)
        }
        let sell = promisesValue2[0]
        let buy = promisesValue2[1]

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

        for (const pair of pairs) {
            const symbols = pair.symbols
            const baseToken = pair.baseToken
            const quoteToken = pair.quoteToken
            const baseTokenAmount = Number(amountBaseToken[i])

            exchangesPrices[i] = {
                symbols,
                baseToken,
                baseTokenAmount,
                quoteToken,
            }
            exchangesPrices[i]['pairs'] = []

            for (const singleExchangePair of pair.pairs) {
                let prices
                try {
                    prices = await this.getPairPrice(
                        amountBaseToken[i],
                        pair.baseToken.address,
                        singleExchangePair.address,
                        singleExchangePair.exchange.routerAddress
                    )
                } catch (error) {
                    console.log(error)
                }

                exchangesPrices[i]['pairs'].push({
                    ...singleExchangePair,
                    prices,
                })
            }
            i++
        }

        return exchangesPrices
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
                let priceDifDir1 = DEX1.prices.sell - DEX2.prices.buy
                let addressBuy = DEX2.address
                let exchangeBuy = DEX2.exchange
                let addressSell = DEX1.address
                let exchangeSell = DEX1.exchange
                result['direction1'] = {
                    direction: [
                        { addressBuy, exchangeBuy },
                        { addressSell, exchangeSell },
                    ],
                    priceDifference: priceDifDir1,
                }
                if (priceDifDir1 > 0) {
                    console.log('Date now -------- ', Date.now())
                    console.log(
                        `BUY ${pair.baseToken.symbol} on ${result['direction1'].direction[0].exchangeBuy.name} and SELL ${pair.quoteToken.symbol} on ${result['direction1'].direction[1].exchangeSell.name}`
                    )
                    console.log('The profit -------- ', priceDifDir1)

                    mailgun.messages().send(
                        {
                            from: 'PRINT BNB <me@samples.mailgun.org>',
                            to: ['limol.lionel@gmail.com', 'lorcann@live.fr'],
                            subject: 'Hello',
                            text: `BUY ${pair.baseToken.symbol} on ${
                                result['direction1'].direction[0].exchangeBuy
                                    .name
                            } and SELL ${pair.quoteToken.symbol} on ${
                                result['direction1'].direction[1].exchangeSell
                                    .name
                            } || profit: ${
                                priceDifDir1 * pair.baseTokenAmount
                            } ${pair.quoteToken.symbol}`,
                        },
                        function (error, body) {
                            console.log(body)
                        }
                    )
                }

                //buy on DEX1 and sell on DEX2
                let priceDifDir2 = DEX2.prices.sell - DEX1.prices.buy
                addressBuy = DEX1.address
                exchangeBuy = DEX1.exchange
                addressSell = DEX2.address
                exchangeSell = DEX2.exchange
                result['direction2'] = {
                    direction: [
                        { addressBuy, exchangeBuy },
                        { addressSell, exchangeSell },
                    ],
                    priceDifference: priceDifDir2,
                }
                if (priceDifDir2 > 0) {
                    console.log('Date now --------', Date.now())
                    console.log(
                        `BUY ${pair.baseToken.symbol} on ${result['direction2'].direction[0].exchangeBuy.name} and SELL ${pair.quoteToken.symbol} on ${result['direction2'].direction[1].exchangeSell.name}`
                    )
                    console.log('The profit -------- ', priceDifDir2)

                    mailgun.messages().send(
                        {
                            from: 'PRINT BNB <me@samples.mailgun.org>',
                            to: ['limol.lionel@gmail.com', 'lorcann@live.fr'],
                            subject: 'Hello',
                            text: `BUY ${pair.baseToken.symbol} on ${
                                result['direction2'].direction[0].exchangeBuy
                                    .name
                            } and SELL ${pair.quoteToken.symbol} on ${
                                result['direction2'].direction[1].exchangeSell
                                    .name
                            } || profit: ${
                                priceDifDir2 * pair.baseTokenAmount
                            } ${pair.quoteToken.symbol}`,
                        },
                        function (error, body) {
                            console.log(body)
                        }
                    )
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
