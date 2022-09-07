const { ethers } = require('hardhat')
const fs = require('fs')

// CONSTANTS
const { getReservesABI, factoryABI } = require('../constants/abi.js')
const {
    baseTokens,
    quoteTokens,
    factoryAddress,
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
    getPairPrice = async (address) => {
        if (address) {
            const pool = new ethers.Contract(
                address,
                getReservesABI,
                this.provider
            )

            const poolReserves = await pool.getReserves()
            const token01 = Number(poolReserves.reserve0._hex)
            const token02 = Number(poolReserves.reserve1._hex)
            const price = token02 / token01

            return price
        }

        return null
    }

    getSwapQuote = async (address) => {}

    updatePairs = async () => {
        let factories = []
        for (const key in factoryAddress) {
            const addr = factoryAddress[key]
            const factory = new ethers.Contract(addr, factoryABI, this.provider)
            factories.push({
                contract: factory,
                exchange: key,
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
            let exchange = []

            for (let j = 0; j < pair.pairs.length; j++) {
                const exchangeName = pair.pairs[j].exchange
                const pairPrice = await this.getPairPrice(pair.pairs[j].address)

                exchange.push({
                    price: pairPrice,
                    name: exchangeName,
                })

                console.log(`${symbols} on ${exchangeName} : ${pairPrice}`)
            }

            // get exchange in and out
            exchange.sort(this.compare)

            const exchangeIn = exchange[0]
            const exchangeOut = exchange.pop()

            console.log(
                `We are going to BUY on ${exchangeIn.name} to SELL on ${exchangeOut.name}`
            )

            // calculate net profit
            const priceService = new PriceService(fee)
            const profit = await priceService.calculateNetProfit(
                exchangeIn.price,
                exchangeOut.price
            )

            console.log(
                `This trade is profitable ? ${profit > 0 ? 'YES' : 'NO'}`
            )
            console.log(`Profit: ${profit}$`)
            console.log('-------------')
        }
    }
}

module.exports = PairService
