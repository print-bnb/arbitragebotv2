require('dotenv').config()

const { ethers } = require('ethers')

const { pairABI } = require('./constants/abi')

const BlockchainService = require('./services/BlockchainService')
const blockchainService = new BlockchainService()

const PairService = require('./services/PairService')
const pairService = new PairService()

const PriceService = require('./services/PriceService')
const priceService = new PriceService()

const startArbitrage = async (amountBaseToken) => {
    // let start = Date.now()
    let pairs, allPrices
    try {
        pairs = await pairService.getAllPairs()
        allPrices = await priceService.getAllPrices(pairs, amountBaseToken)
    } catch (error) {
        console.log(error)
    }

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

    //listen Swap events on smart contracts
    // const ETHUSDTPancakePairContract = new ethers.Contract(
    //     '0x531FEbfeb9a61D948c384ACFBe6dCc51057AEa7e',
    //     pairABI,
    //     blockchainService.getProvider()
    // )
    // const ETHUSDTBiswapPairContract = new ethers.Contract(
    //     '0x63b30de1A998e9E64FD58A21F68D323B9BcD8F85',
    //     pairABI,
    //     blockchainService.getProvider()
    // )

    // ETHUSDTPancakePairContract.on(
    //     'Swap',
    //     (sender, amount0In, amount1In, amount0Out, amount1Out, to) => {
    //         console.log(
    //             '0-----PANCAKE',
    //             'sender---',
    //             sender,
    //             'amount0In---',
    //             amount0In,
    //             'amount1In---',
    //             amount1In,
    //             'amount0Out---',
    //             amount0Out,
    //             'amount1Out---',
    //             amount1Out,
    //             'to',
    //             to,
    //             '--------------------------'
    //         )
    //     }
    // )

    // ETHUSDTBiswapPairContract.on(
    //     'Swap',
    //     (sender, amount0In, amount1In, amount0Out, amount1Out, to) => {
    //         console.log(
    //             '0-----BISWAP',
    //             'sender---',
    //             sender,
    //             'amount0In---',
    //             amount0In,
    //             'amount1In---',
    //             amount1In,
    //             'amount0Out---',
    //             amount0Out,
    //             'amount1Out---',
    //             amount1Out,
    //             'to---',
    //             to,
    //             '--------------------------'
    //         )
    //     }
    // )

    //getting pending txns in mempool
    // let pendingTxnArray = []
    // blockchainService.getProvider().on('pending', async (tx) => {
    //     let txInfo = blockchainService.getProvider().getTransaction(tx)
    //     pendingTxnArray.push(txInfo)
    //     Promise.allSettled(pendingTxnArray)
    //     console.log(pendingTxnArray)
    // })

    try {
        blockchainService.getProvider().on('block', async (blockNumber) => {
            try {
                await startArbitrage(amountBaseToken)
            } catch (error) {
                console.log(error)
            }
        })
    } catch (error) {
        console.log(error)
    }
}

main()

// refreshPairs()
