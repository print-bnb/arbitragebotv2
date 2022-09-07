const { ethers } = require('hardhat')
const fs = require('fs')

// CONSTANTS
const {
    getReservesABI,
    factoryABI,
    getAmountsOut,
} = require('../constants/abi.js')
const {
    baseTokens,
    quoteTokens,
    factoryAddress,
    routerAddress,
    tradingFees,
} = require('../constants/config')
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const pairFile = './pairs.json'

// SERVICES
const Provider = require('./Provider.js')
const PriceService = require('./PriceService.js')

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

    // get pair price from pair address
    getPairPrice = async (
        amountIn,
        pairAddress,
        routerAddress,
        factoryAddress
    ) => {
        const pair = new ethers.Contract(
            pairAddress,
            getReservesABI,
            this.provider
        )
        const router = new ethers.Contract(
            routerAddress,
            getAmountsOut,
            this.provider
        )

        // function getAmountsOut(address factory, uint amountIn, address[] memory path)

        // const poolReserves = await pair.getReserves()
        // const token0 = Number(poolReserves.reserve0._hex)
        // const token1 = Number(poolReserves.reserve1._hex)
        // const pairPrice = token1 / token0

        // const token0Address = await pair.
        // const token1Address = await pair.
        const pairPrice = await router.getAmountsOut(
            factoryAddress,
            amountIn,
            [
                0x55d398326f99059ff775485246999027b3197955,
                0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c,
            ]
        )

        return { pairPrice, token01, token02 }
    }

    getSwapQuote = async (address) => {}

    updatePairs = async () => {
        let factories = []

        for (let i = 0; i < Object.keys(factoryAddress).length; i++) {
            const factory = new ethers.Contract(
                factoryAddress[Object.keys(factoryAddress)[i]],
                factoryABI,
                this.provider
            )

            const router = new ethers.Contract(
                routerAddress[Object.keys(routerAddress)[i]],
                getAmountsOut,
                this.provider
            )

            factories.push({
                contract: factory,
                router: router,
                exchange: Object.keys(factoryAddress)[i],
            })
        }

        let tokenPairs = []
        for (const key in baseTokens) {
            const baseToken = baseTokens[key]
            for (const quoteKey in quoteTokens) {
                const quoteToken = quoteTokens[quoteKey]
                const symbols = `${quoteToken.symbol}-${baseToken.symbol}`
                const duplicateSymbols = `${baseToken.symbol}-${quoteToken.symbol}`

                if (
                    quoteToken.symbol === baseToken.symbol ||
                    tokenPairs.some((obj) =>
                        obj.symbols.includes(duplicateSymbols)
                    )
                )
                    continue

                let tokenPair = { symbols, pairs: [] }

                for (const factory of factories) {
                    console.log('-------')
                    console.log(`search for ${symbols} on ${factory.exchange}`)
                    // try {
                    const pair = await factory.contract.getPair(
                        baseToken.address,
                        quoteToken.address
                    )
                    if (pair != ZERO_ADDRESS) {
                        console.log(`find ${symbols} on ${factory.exchange}`)
                        tokenPair.pairs.push({
                            address: pair,
                            exchange: factory.exchange,
                            factory: factory.contract.address,
                            router: factory.router.address,
                        })
                    } else {
                        console.log(
                            `don't find ${symbols} on ${factory.exchange}`
                        )
                    }
                    // } catch (error) {
                    if (tokenPair.pairs.length >= 2) {
                        tokenPairs.push(tokenPair)
                    }
                    // }
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

    // function to sort array by price
    compare = (a, b) => {
        if (a.price < b.price) {
            return -1
        }
        if (a.price > b.price) {
            return 1
        }
        return 0
    }

    // identify opportunites from array of pairs => use getAllPairs()
    getOpportunities = async (pairs) => {
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i]
            const symbols = pair.symbols
            let exchangesPrices = []

            for (let j = 0; j < pair.pairs.length; j++) {
                const exchangeName = pair.pairs[j].exchange
                const { pairPrice } = await this.getPairPrice(
                    1,
                    pair.pairs[j].address,
                    pair.pairs[j].router,
                    pair.pairs[j].factory
                )

                exchangesPrices.push({
                    price: pairPrice,
                    name: exchangeName,
                })

                console.log(`${symbols} on ${exchangeName} : ${pairPrice}`)
            }

            // get exchange in and out
            exchangesPrices.sort(this.compare)

            console.log(
                `We are going to BUY on ${
                    exchangesPrices[exchangesPrices.length - 1].name
                } to SELL on ${exchangesPrices[0].name}`
            )

            // calculate net profit
            const priceService = new PriceService(tradingFees)
            const profit = await priceService.computeUnitProfit(exchangesPrices)

            console.log(
                `This trade is profitable ? ${profit > 0 ? 'YES' : 'NO'}`
            )
            console.log(`Profit: ${profit}$`)
            console.log('-------------')
        }
    }
}

module.exports = PairService
