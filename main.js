require('dotenv').config()

const Provider = require('./services/Provider')
const providerService = new Provider()

const PairService = require('./services/PairService')
const pairService = new PairService()

const PriceService = require('./services/PriceService')
const priceService = new PriceService()

const startArbitrage = async (amountBaseToken) => {
    const pairs = await pairService.getAllPairs()
    let allPrices = await priceService.getAllPrices(pairs, amountBaseToken)
    let allPricesComb = priceService.combineDEXtrades(allPrices)
    let isProfitable = priceService.computeProfit(allPricesComb)
}

const refreshPairs = async () => {
    try {
        await pairService.updatePairs()
    } catch (error) {
        console.log({ error })
    }
}

async function main() {
    // price from DEX are calculated for trading X amount of baseToken against
    // an unknown amount of quoteToken
    let amountBaseToken = ['1.8110', '0.3152', '0.3152', '0.02485', '0.02485']

    providerService.getProvider().on('block', async (blockNumber) => {
        await startArbitrage(amountBaseToken)
    })
}

main()

// refreshPairs()
