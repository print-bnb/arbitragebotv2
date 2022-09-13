const { provider } = require('../constants/config')
const { ethers } = require('hardhat')

class Provider {
    constructor() {
        this.provider = new ethers.providers.WebSocketProvider(provider)
    }

    getProvider = () => this.provider
}

module.exports = Provider
