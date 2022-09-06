module.exports = {
    provider: "https://bsc-dataseed.binance.org",

    factoryAddress: {
        PANCAKE: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
        BISWAP: "0x858E3312ed3A876947EA49d572A7C42DE08af7EE",
        BAKERY: "0x01bF7C66c6BD861915CdaaE475042d3c4BaE16A7",
        MDEX: '0x3CD1C46068dAEa5Ebb0d3f55F6915B10648062B8',
        JULSWAP: '0x553990F2CBA90272390f62C5BDb1681fFc899675',
        APESWAP: '0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6',
    },

    router: {
        PANCAKE: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
        BISWAP: "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8"
    },

    baseTokens: {
        usdt: { symbol: "USDT", address: "0x55d398326f99059ff775485246999027b3197955" },
        wbnb: { symbol: "WBNB", address: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c" },
        busd: { symbol: "BUSD", address: "0xe9e7cea3dedca5984780bafc599bd69add087d56" }
    },

    quoteTokens: {
        eth: { symbol: "ETH", address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8" },
        cake: { symbol: "CAKE", address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82" },
    }
}
    