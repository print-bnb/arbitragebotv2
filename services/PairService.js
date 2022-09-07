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
} = require('../constants/config')

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
        console.log('binks')
        // const poolReserves = await pair.getReserves()
        // const token0 = Number(poolReserves.reserve0._hex)
        // const token1 = Number(poolReserves.reserve1._hex)
        // const pairPrice = token1 / token0

        let addressToken0 = await pairContractInstance.token0
        let addressToken1 = await pairContractInstance.token1
        const path = [addressToken0, addressToken1]

        const pairPrice = await routerContractInstance.getAmountsOut(
            amountIn,
            path
        )

        return pairPrice
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
                        console.log(tokenPairs)
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
        for (const pair of pairs) {
            const symbols = pair.symbols
            let exchangesPrices = []

            for (const singleExchangePair of pair.pairs) {
                const exchangeName = singleExchangePair.exchange.name

                const pairPrice = await this.getPairPrice(
                    1,
                    singleExchangePair.address,
                    singleExchangePair.exchange.routerAddress,
                    singleExchangePair.exchange.factoryAddress
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
