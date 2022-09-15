const { ethers } = require('hardhat')
const fs = require('fs')

const { factoryABI, routerABI } = require('../constants/abi')
const {
    baseTokens,
    quoteTokens,
    factoryAddress,
    routerAddress,
    ZERO_ADDRESS,
    tradingFees,
} = require('../constants/config')

const pairFile = './pairs.json'

const BlockchainService = require('./BlockchainService.js')
const PriceService = require('./PriceService.js')
const priceService = new PriceService(tradingFees)

class PairService extends BlockchainService {
    constructor() {
        super()
    }

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
}

module.exports = PairService
