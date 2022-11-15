import { ethers } from 'ethers';
import config from '../../constants/config';

export class BlockchainService {
  protected provider: ethers.providers.WebSocketProvider;
  constructor() {
    this.provider = new ethers.providers.WebSocketProvider(config.provider);
  }

  getProvider = () => this.provider;

  getGasPrice = async () => {
    let gasEstimate;
    try {
      gasEstimate = await this.provider.getGasPrice();
    } catch (error) {
      console.log(error);
    }
    return ethers.utils.formatUnits(gasEstimate);
  };
}
