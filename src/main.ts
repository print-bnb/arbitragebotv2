import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
dotenv.config();
import { BlockchainService } from './services/BlockchainService';
import { PairService } from './services/PairService';
import { ExchangePrice, PriceService } from './services/PriceService';

const blockchainService = new BlockchainService();

const pairService = new PairService();

const priceService = new PriceService();

const startArbitrage = async (amountBaseToken: ethers.BigNumber[]) => {
  // let start = Date.now()
  let allPrices: ExchangePrice[];
  try {
    // console.time('pairService.getAllPairs');
    const pairs = pairService.getAllPairs();
    // console.timeEnd('pairService.getAllPairs');

    console.time('priceService.getAllPrices');
    allPrices = await priceService.getAllPrices(pairs, amountBaseToken);
    console.timeEnd('priceService.getAllPrices');

    // console.time('priceService.combineDEXtrades');
    let allPricesComb = priceService.combineDEXtrades(allPrices);
    // console.timeEnd('priceService.combineDEXtrades');
    // console.time('priceService.computeProfit');
    let isProfitable = priceService.computeProfit(allPricesComb);
    // console.timeEnd('priceService.computeProfit');
  } catch (error) {
    console.log(error);
  }
};

const refreshPairs = async () => {
  try {
    await pairService.updatePairs();
  } catch (error) {
    console.log({ error });
  }
};

async function main() {
  // price from DEX are calculated for trading X amount of baseToken (value ~ 500 USD) against
  // an unknown amount of quoteToken
  // we still need to find the maximum profit value of X to trade
  const amountBaseToken: ethers.BigNumber[] = [
    '1.8',
    '0.35',
    '0.35',
    '0.025',
    '0.025',
  ].map((strAmount) => ethers.utils.parseUnits(strAmount, 18));

  blockchainService.getProvider().on('block', async (blockNumber) => {
    try {
      console.info('blockNumber: ' + blockNumber);
      console.time('startArbitrage');
      await startArbitrage(amountBaseToken);
      console.timeEnd('startArbitrage');
    } catch (error) {
      console.log(error);
    }
  });
}

main();

// refreshPairs()
