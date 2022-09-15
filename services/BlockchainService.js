const { provider } = require('../constants/config')
const { ethers } = require('hardhat')

class BlockchainService {
    constructor() {
        this.provider = new ethers.providers.WebSocketProvider(provider)
    }

    getProvider = () => this.provider

    getGasPrice = async () => {
        return ethers.utils.formatUnits(await this.provider.getGasPrice())
    }
}

module.exports = BlockchainService
