class PriceService {
    constructor(fee) {
        this.fee = fee
    }

    calculateNetProfit = (priceA, priceB) => {
        return priceA - priceB - this.fee
    }
}

module.exports = PriceService
