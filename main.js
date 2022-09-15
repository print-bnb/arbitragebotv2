require('dotenv').config()

const Provider = require('./services/Provider')
const providerService = new Provider()

const PairService = require('./services/PairService')
const pairService = new PairService()

const PriceService = require('./services/PriceService')
const priceService = new PriceService()

const startArbitrage = async (amountBaseToken) => {
    let start = Date.now()
    const pairs = await pairService.getAllPairs()
    let allPrices = await priceService.getAllPrices(pairs, amountBaseToken)
    let allPricesComb = priceService.combineDEXtrades(allPrices)
    let isProfitable = priceService.computeProfit(allPricesComb)
    console.log(Date.now() - start)
}

const refreshPairs = async () => {
    try {
        await pairService.updatePairs()
    } catch (error) {
        console.log({ error })
    }
}

async function main() {
    let i = 0

    // price from DEX are calculated for trading X amount of baseToken against
    // an unknown amount of quoteToken
    let amountBaseToken = ['1.8110', '0.3152', '0.3152', '0.02485', '0.02485']

    providerService.getProvider().on('block', async (blockNumber) => {
        let condition = i % 10 == 0
        if (condition) {
            await startArbitrage(amountBaseToken)
            console.log(i, i % 10, blockNumber)
        }
        i++
    })
}

main()

// refreshPairs()
