class PriceService {
    constructor(tradingFees) {
        this.tradingFees = tradingFees
    }

    computeUnitProfit = (exchangesPrices) => {
        let priceRatio =
            exchangesPrices[exchangesPrices.length - 1].price /
            exchangesPrices[0].price
        let buyFees =
            (100 -
                this.tradingFees[
                    exchangesPrices[exchangesPrices.length - 1].name
                ]) /
            100
        let sellFees = (100 - this.tradingFees[exchangesPrices[0].name]) / 100

        return priceRatio * buyFees * sellFees - 1
    }
}

module.exports = PriceService
