require('dotenv').config()

const BlockchainService = require('./services/BlockchainService')
const blockchainService = new BlockchainService()

const PairService = require('./services/PairService')
const pairService = new PairService()

const PriceService = require('./services/PriceService')
const priceService = new PriceService()

const startArbitrage = async (amountBaseToken) => {
    // let start = Date.now()
    const pairs = await pairService.getAllPairs()
    let allPrices = await priceService.getAllPrices(pairs, amountBaseToken)
    let allPricesComb = priceService.combineDEXtrades(allPrices)
    let isProfitable = priceService.computeProfit(allPricesComb)
    // console.log(Date.now()-start)
}

const refreshPairs = async () => {
    try {
        await pairService.updatePairs()
    } catch (error) {
        console.log({ error })
    }
}

async function main() {
    // price from DEX are calculated for trading X amount of baseToken (value ~ 500 USD) against
    // an unknown amount of quoteToken
    // we still need to find the maximum profit value of X to trade
    let amountBaseToken = ['1.8', '0.35', '0.35', '0.025', '0.025']

    blockchainService.getProvider().on('block', async (blockNumber) => {
        try {
            await startArbitrage(amountBaseToken)
        } catch (error) {
            console.log(error)
        }
    })
}

main()

// refreshPairs()
