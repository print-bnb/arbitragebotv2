const { ethers } = require('hardhat')
const fs = require('fs')

// CONSTANTS
const { factoryABI, routerABI, pairABI } = require('../constants/abi.js')

const {
    baseTokens,
    quoteTokens,
    factoryAddress,
    routerAddress,
    ZERO_ADDRESS,
    tradingFees,
} = require('../constants/config')

const pairFile = './pairs.json'

// SERVICES
const Provider = require('./Provider.js')
const PriceService = require('./PriceService.js')
const priceService = new PriceService(tradingFees)

class PairService extends Provider {
    constructor() {
        super()
    }

    // get all pairs from json file
    getAllPairs = async () => {
        let pairs = []
        try {
            pairs = JSON.parse(fs.readFileSync(pairFile, 'utf-8'))
        } catch (err) {
            pairs = null
        }

        return pairs
    }

    updatePairs = async () => {
        let exchangesContracts = []

        for (let i = 0; i < Object.keys(factoryAddress).length; i++) {
            const factory = new ethers.Contract(
                factoryAddress[Object.keys(factoryAddress)[i]],
                factoryABI,
                this.provider
            )

            const router = new ethers.Contract(
                routerAddress[Object.keys(routerAddress)[i]],
                routerABI,
                this.provider
            )

            exchangesContracts.push({
                factory,
                router,
                exchangeName: Object.keys(factoryAddress)[i],
            })
        }

        let tokenPairs = []
        for (const key in baseTokens) {
            const baseToken = baseTokens[key]
            for (const quoteKey in quoteTokens) {
                const quoteToken = quoteTokens[quoteKey]
                const symbols = `${baseToken.symbol}-${quoteToken.symbol}`
                const duplicateSymbols = `${quoteToken.symbol}-${baseToken.symbol}`

                if (
                    quoteToken.symbol === baseToken.symbol ||
                    tokenPairs.some((obj) =>
                        obj.symbols.includes(duplicateSymbols)
                    ) ||
                    symbols === 'BUSD-USDT' ||
                    symbols === 'USDT-BUSD' ||
                    baseToken.symbol === 'USDT' ||
                    baseToken.symbol === 'BUSD' ||
                    baseToken.symbol === 'USDC'
                )
                    continue

                let tokenPair = {
                    symbols,
                    baseToken,
                    quoteToken,
                    pairs: [],
                }
                tokenPair.baseToken.address = ethers.utils.getAddress(
                    tokenPair.baseToken.address
                )
                tokenPair.quoteToken.address = ethers.utils.getAddress(
                    tokenPair.quoteToken.address
                )

                for (const exchange of exchangesContracts) {
                    console.log('-------')
                    console.log(
                        `search for ${symbols} on ${exchange.exchangeName}`
                    )

                    const pairAddress = await exchange.factory.getPair(
                        baseToken.address,
                        quoteToken.address
                    )

                    if (pairAddress != ZERO_ADDRESS) {
                        console.log(
                            `find ${symbols} on ${exchange.exchangeName}`
                        )
                        tokenPair.pairs.push({
                            address: pairAddress,
                            exchange: {
                                name: exchange.exchangeName,
                                factoryAddress: exchange.factory.address,
                                routerAddress: exchange.router.address,
                            },
                        })
                    } else {
                        console.log(
                            `don't find ${symbols} on ${exchange.exchangeName}`
                        )
                    }

                    if (tokenPair.pairs.length >= 2) {
                        tokenPairs.push(tokenPair)
                    }
                }
            }
        }

        let tokenPairWithoutDuplicates = [...new Set(tokenPairs)]

        fs.writeFile(
            pairFile,
            JSON.stringify(tokenPairWithoutDuplicates),
            async function (err) {
                if (err) {
                    return console.log(err)
                }
                console.log('Pairs file updated!')
            }
        )
    }

    // identify opportunites from array of pairs => use getAllPairs()
    getOpportunities = async (pairs) => {
        // amount of baseToken to trade against quoteToken
        let amountIn = '1'
        for (const pair of pairs) {
            const symbols = pair.symbols
            let exchangesPrices = []

            for (const singleExchangePair of pair.pairs) {
                const exchangeName = singleExchangePair.exchange.name

                const {
                    pairPriceWithFeesSell,
                    pairPriceWithFeesBuy,
                    pairPriceWithoutFees,
                } = await priceService.getPairPrice(
                    amountIn,
                    pair.baseToken.address,
                    singleExchangePair.address,
                    singleExchangePair.exchange.routerAddress
                )

                let pairPriceWithFeesComputed =
                    priceService.computePriceWithFees(
                        pairPriceWithoutFees,
                        exchangeName
                    )
                exchangesPrices.push({
                    pairPriceWithFeesSell,
                    pairPriceWithFeesComputed,
                    pairPriceWithoutFees,
                    name: exchangeName,
                })

                console.log(
                    `${symbols} on ${exchangeName} : BUYER rate (bid) ${pairPriceWithFeesSell} and SELLER rate (ask) ${pairPriceWithFeesBuy} with Fees`
                )
                console.log(
                    `*******************   From reserves: ${pairPriceWithFeesComputed} computedFees and ${pairPriceWithoutFees} without Fees`
                )
            }

            // get exchange in and out
            exchangesPrices.sort(
                (a, b) => a.pairPriceWithFeesSell - b.pairPriceWithFeesSell
            )

            console.log(
                `We are going to BUY ${pair.baseToken.symbol} on ${
                    exchangesPrices[exchangesPrices.length - 1].name
                } to SELL ${pair.quoteToken.symbol} on ${
                    exchangesPrices[0].name
                }`
            )

            // calculate net profit
            const profit = priceService.computeUnitProfit(exchangesPrices)

            console.log(
                `This trade is profitable ? ${profit > 0 ? 'YES' : 'NO'}`
            )
            console.log(`Profit: ${profit}$`)
            console.log('-------------\n-------------')
        }
    }
}

module.exports = PairService
