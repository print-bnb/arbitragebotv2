import * as dotenv from 'dotenv';
dotenv.config();
import { BlockchainService } from './services/BlockchainService';
import { PairService } from './services/PairService';
import { ExchangePrice, PriceService } from './services/PriceService';

const blockchainService = new BlockchainService();

const pairService = new PairService();

const priceService = new PriceService();

const startArbitrage = async (amountBaseToken: string[]) => {
  // let start = Date.now()
  let allPrices: ExchangePrice[];
  try {
    const pairs = pairService.getAllPairs();
    allPrices = await priceService.getAllPrices(pairs, amountBaseToken);

    let allPricesComb = priceService.combineDEXtrades(allPrices);
    let isProfitable = priceService.computeProfit(allPricesComb);
    // console.log(Date.now()-start)
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
  const amountBaseToken = ['1.8', '0.35', '0.35', '0.025', '0.025'];

  blockchainService.getProvider().on('block', async (blockNumber) => {
    try {
      console.info('blockNumber: ' + blockNumber);
      await startArbitrage(amountBaseToken);
    } catch (error) {
      console.log(error);
    }
  });
}

main();

// refreshPairs()
