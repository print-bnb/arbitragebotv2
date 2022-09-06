const { provider } = require("../constants/config");
const { ethers } = require('hardhat');

class Provider {
    
    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider(provider);
    }

}

module.exports = Provider;