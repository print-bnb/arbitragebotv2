const { provider } = require('../constants/config')
const { ethers } = require('ethers')

class BlockchainService {
    constructor() {
        this.provider = new ethers.providers.WebSocketProvider(provider)
    }

    getProvider = () => this.provider

    getGasPrice = async () => {
        let gasEstimate
        try {
            gasEstimate = await this.provider.getGasPrice()
        } catch (error) {
            console.log(error)
        }
        return ethers.utils.formatUnits(gasEstimate)
    }
}

module.exports = BlockchainService
