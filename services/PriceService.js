const { ethers } = require('hardhat')

const { factoryABI, routerABI, pairABI } = require('../constants/abi.js')

const Provider = require('./Provider.js')

class PriceService extends Provider {
    constructor(tradingFees) {
        super()
        this.tradingFees = tradingFees
    }

    // get pair price from pair address
    getPairPrice = async (
        amountIn,
        baseTokenAddress,
        pairAddress,
        routerAddress
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

        //getting reserves
        const poolReserves = pairContractInstance.getReserves()

        //quotation with fees
        let addressToken0 = pairContractInstance.token0()
        let addressToken1 = pairContractInstance.token1()

        let [fromPoolReserves, fromToken0, fromToken1] =
            await Promise.allSettled([
                poolReserves,
                addressToken0,
                addressToken1,
            ])

        addressToken0 = fromToken0.value
        addressToken1 = fromToken1.value

        const token0 = Number(
            ethers.utils.formatEther(fromPoolReserves.value[0])
        )
        const token1 = Number(
            ethers.utils.formatEther(fromPoolReserves.value[1])
        )

        let pairPrice, pathSell, pathBuy
        if (baseTokenAddress !== addressToken0) {
            pairPrice = token0 / token1
            pathSell = [addressToken1, addressToken0]
            pathBuy = [addressToken0, addressToken1]
        } else {
            pairPrice = token1 / token0
            pathSell = [addressToken0, addressToken1]
            pathBuy = [addressToken1, addressToken0]
        }

        const pairPriceArraySell = await routerContractInstance.getAmountsOut(
            ethers.utils.parseUnits(amountIn, 18),
            pathSell
        )
        const pairPriceArrayBuy = await routerContractInstance.getAmountsOut(
            ethers.utils.parseUnits(amountIn, 18),
            pathBuy
        )

        return {
            pairPriceWithFeesSell: Number(
                ethers.utils.formatEther(pairPriceArraySell[1])
            ),
            pairPriceWithFeesBuy:
                1 / Number(ethers.utils.formatEther(pairPriceArrayBuy[1])),
            pairPriceWithoutFees: pairPrice,
        }
    }

    computeUnitProfit = (exchangesPrices) => {
        let priceRatio =
            exchangesPrices[exchangesPrices.length - 1].pairPriceWithoutFees /
            exchangesPrices[0].pairPriceWithoutFees
        let buyFees =
            (100 -
                this.tradingFees[
                    exchangesPrices[exchangesPrices.length - 1].name
                ]) /
            100
        let sellFees = (100 - this.tradingFees[exchangesPrices[0].name]) / 100

        return priceRatio * buyFees * sellFees - 1
    }

    computePriceWithFees = (pairPriceWithoutFees, exchangeName) => {
        return (
            (pairPriceWithoutFees * (100 - this.tradingFees[exchangeName])) /
            100
        )
    }
}

module.exports = PriceService
