import { BigNumber, ethers } from 'ethers';
import 'lodash.combinations';
import _ from 'lodash';
import ABI from '../../constants/abi';
import { Pair, Pair__pair } from '../pairs';
import { BlockchainService } from './BlockchainService';
import { MailService } from './MailService';

const { routerABI, pairABI } = ABI;

export interface PairPrice {
  prices: {
    sell: number;
    reserve: number;
    buy: number;
  };
}
export interface ExchangePrice {
  symbols: string;
  baseToken: { symbol: string; address: string };
  baseTokenAmount: number;
  quoteToken: { symbol: string; address: string };
  pairs: (Pair__pair & { prices: PairPrice })[];
}

export interface ExchangePriceWithComputation extends ExchangePrice {
  profitComputation: ProfitComputationResult[];
}

export interface ProfitComputationResult__direction {
  direction: [{ addressBuy; exchangeBuy }, { addressSell; exchangeSell }];
  priceDifference: number;
}

export interface ProfitComputationResult {
  direction1: ProfitComputationResult__direction;
  direction2: ProfitComputationResult__direction;
}

export class PriceService extends BlockchainService {
  protected mailService: MailService;
  constructor() {
    super();
    this.mailService = new MailService();
  }

  getPairPrice = async (
    amountBaseToken: ethers.BigNumber,
    baseTokenAddress: string,
    pairAddress: string,
    routerAddress: string,
    singleExchangePair: Pair__pair
  ): Promise<PairPrice & Pair__pair> => {
    const pairContractInstance = new ethers.Contract(
      pairAddress,
      pairABI,
      this.provider
    );
    const routerContractInstance = new ethers.Contract(
      routerAddress,
      routerABI,
      this.provider
    );
    try {
      // console.time('FetchReserves');
      const [fromPoolReserves, addressToken0, addressToken1] =
        await Promise.all([
          pairContractInstance.getReserves(),
          pairContractInstance.token0(),
          pairContractInstance.token1(),
        ]);
      // console.timeEnd('FetchReserves');

      const token0 = Number(ethers.utils.formatEther(fromPoolReserves[0]));
      const token1 = Number(ethers.utils.formatEther(fromPoolReserves[1]));

      let pairPrice, pathSell, pathBuy;
      if (baseTokenAddress !== addressToken0) {
        pairPrice = token0 / token1;
        pathSell = [addressToken1, addressToken0];
        pathBuy = [addressToken0, addressToken1];
      } else {
        pairPrice = token1 / token0;
        pathSell = [addressToken0, addressToken1];
        pathBuy = [addressToken1, addressToken0];
      }

      // selling amountIn of baseToken (token0) for amountOut (unknown) of quoteToken (token1)
      let pairPriceArraySellPromise = routerContractInstance.getAmountsOut(
        amountBaseToken,
        pathSell
      );

      // buying amountIn (unknown) of baseToken (token0) with amountInQuoteToken of quoteToken (token1)
      let pairPriceArrayBuyPromise = routerContractInstance.getAmountsIn(
        amountBaseToken,
        pathBuy
      );

      // console.time('getAmountsIn/out');
      const [sell, buy] = await Promise.all([
        pairPriceArraySellPromise,
        pairPriceArrayBuyPromise,
      ]);
      // console.timeEnd('getAmountsIn/out');

      return {
        ...singleExchangePair,
        prices: {
          sell:
            Number(ethers.utils.formatEther(sell[1] as BigNumber)) /
            Number(ethers.utils.formatEther(sell[0] as BigNumber)),
          reserve: pairPrice,
          buy:
            Number(ethers.utils.formatEther(buy[0] as BigNumber)) /
            Number(ethers.utils.formatEther(buy[1] as BigNumber)),
        },
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  private fetchPriceForPair = async (
    pair: Pair,
    baseTokenAmount: ethers.BigNumber
  ): Promise<ExchangePrice> => {
    const symbols = pair.symbols;
    const baseToken = pair.baseToken;
    const quoteToken = pair.quoteToken;
    const exchangesPrice: ExchangePrice = {
      symbols,
      baseToken,
      baseTokenAmount: Number(ethers.utils.formatEther(baseTokenAmount)),
      quoteToken,
      pairs: [],
    };
    const fetchPairPricesPromises: any[] = [];

    for (const singleExchangePair of pair.pairs) {
      fetchPairPricesPromises.push(
        this.getPairPrice(
          baseTokenAmount,
          pair.baseToken.address,
          singleExchangePair.address,
          singleExchangePair.exchange.routerAddress,
          singleExchangePair
        )
      );
    }
    const results = await Promise.all(fetchPairPricesPromises);
    exchangesPrice.pairs = results;
    return exchangesPrice;
  };

  getAllPrices = async (pairs: Pair[], amountBaseToken: ethers.BigNumber[]) => {
    let exchangesPrices: ExchangePrice[] = [];
    let i = 0;

    const promises: Promise<ExchangePrice>[] = [];
    for (const pair of pairs) {
      const baseTokenAmount = amountBaseToken[i];
      promises.push(this.fetchPriceForPair(pair, baseTokenAmount));
      i++;
    }
    exchangesPrices = await Promise.all(promises);

    return exchangesPrices;
  };

  combineDEXtrades = (allPrices: ExchangePrice[]) => {
    for (let i = 0; i < allPrices.length; i++) {
      let pair = allPrices[i];
      allPrices[i].pairs = _.combinations(pair.pairs, 2);
    }

    return allPrices;
  };

  computeProfit = (
    allPricesComb: ExchangePrice[]
  ): ExchangePriceWithComputation[] => {
    const result: ExchangePriceWithComputation[] = [];
    for (let i = 0; i < allPricesComb.length; i++) {
      let pair = allPricesComb[i];
      let pricesDEXComb = pair.pairs;

      let profitComputation: ProfitComputationResult[] = [];
      for (let j = 0; j < pricesDEXComb.length; j++) {
        let dualDEXtrade = pricesDEXComb[j];

        //trades are only between two DEXs
        let DEX1 = dualDEXtrade[0];
        let DEX2 = dualDEXtrade[1];

        //buy on DEX2 and sell on DEX1
        let priceDifDir1 = DEX1.prices.sell - DEX2.prices.buy;
        let priceDifDir2 = DEX2.prices.sell - DEX1.prices.buy;
        let result: ProfitComputationResult = {
          direction1: {
            direction: [
              { addressBuy: DEX2.address, exchangeBuy: DEX2.exchange },
              { addressSell: DEX1.address, exchangeSell: DEX1.exchange },
            ],
            priceDifference: priceDifDir1,
          },
          direction2: {
            direction: [
              { addressBuy: DEX1.address, exchangeBuy: DEX1.exchange },
              { addressSell: DEX2.address, exchangeSell: DEX2.exchange },
            ],
            priceDifference: priceDifDir2,
          },
        };
        if (priceDifDir1 > 0) {
          console.log('Date now -------- ', Date.now());
          console.log(
            `BUY ${pair.baseToken.symbol} on ${result['direction1'].direction[0].exchangeBuy.name} and SELL ${pair.quoteToken.symbol} on ${result['direction1'].direction[1].exchangeSell.name}`
          );
          console.log('The price difference -------- ', priceDifDir1);

          this.mailService.sendGenericEmail({
            pair,
            exchangeBuy: result.direction1.direction[0].exchangeBuy,
            exchangeSell: result.direction1.direction[1].exchangeSell,
            priceDifDir: priceDifDir1,
          });
        }

        if (priceDifDir2 > 0) {
          console.log('Date now --------', Date.now());
          console.log(
            `BUY ${pair.baseToken.symbol} on ${result['direction2'].direction[0].exchangeBuy.name} and SELL ${pair.quoteToken.symbol} on ${result['direction2'].direction[1].exchangeSell.name}`
          );
          console.log('The price difference -------- ', priceDifDir2);

          this.mailService.sendGenericEmail({
            pair,
            exchangeBuy: result.direction2.direction[0].exchangeBuy,
            exchangeSell: result.direction2.direction[1].exchangeSell,
            priceDifDir: priceDifDir2,
          });
        }

        profitComputation.push(result);
      }
      result.push({
        ...allPricesComb[i],
        profitComputation,
      });
    }

    return result;
  };

  isProfitable = () => {};

  getBiggestProfit = async (isProfitable) => {};
}
