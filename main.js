require('dotenv').config()

const Provider = require('./services/Provider')
const PairService = require('./services/PairService')
const pairService = new PairService()
const providerService = new Provider()

const startArbitrage = async () => {
    let start = Date.now()
    const pairs = await pairService.getAllPairs()
    await pairService.getOpportunities(pairs)
    console.log(Date.now() - start)
}

const refreshPairs = async () => {
    try {
        await pairService.updatePairs()
    } catch (error) {
        console.log({ error })
    }
}

// async function main() {
//     providerService.getProvider().on('block', async (blockNumber) => {
//         startArbitrage()
//     })
// }

// main()

startArbitrage()
// refreshPairs()
