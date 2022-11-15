import { ethers } from 'ethers';
import * as _ from 'lodash';
import mailGunJs from 'mailgun-js';
import ABI from '../../constants/abi';
import { Pair, Pair__pair } from '../pairs';
import { BlockchainService } from './BlockchainService';

const mailgun = mailGunJs({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

const { routerABI, pairABI } = ABI;

export interface PairPrice {
  sell: number;
  reserve: number;
  buy: number;
}
export interface ExchangePrice {
  symbols: string;
  baseToken: { symbol: string; address: string };
  baseTokenAmount: number;
  quoteToken: { symbol: string; address: string };
  pairs: (Pair__pair & { prices: PairPrice })[];
  profitComputation?: ProfitComputationResult[];
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
  constructor() {
    super();
  }

  getPairPrice = async (
    amountBaseToken: string,
    baseTokenAddress: string,
    pairAddress: string,
    routerAddress: string
  ): Promise<PairPrice> => {
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

    const poolReserves = pairContractInstance.getReserves();

    let addressToken0 = pairContractInstance.token0();
    let addressToken1 = pairContractInstance.token1();

    let promisesValue1;
    try {
      promisesValue1 = await Promise.allSettled([
        poolReserves,
        addressToken0,
        addressToken1,
      ]);
    } catch (error) {
      console.log(error);
    }

    let fromPoolReserves = promisesValue1[0];
    let fromToken0 = promisesValue1[1];
    let fromToken1 = promisesValue1[2];

    addressToken0 = fromToken0.value;
    addressToken1 = fromToken1.value;

    const token0 = Number(ethers.utils.formatEther(fromPoolReserves.value[0]));
    const token1 = Number(ethers.utils.formatEther(fromPoolReserves.value[1]));

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
    let pairPriceArraySell = routerContractInstance.getAmountsOut(
      ethers.utils.parseUnits(amountBaseToken, 18),
      pathSell
    );

    // buying amountIn (unknown) of baseToken (token0) with amountInQuoteToken of quoteToken (token1)
    let pairPriceArrayBuy = routerContractInstance.getAmountsIn(
      ethers.utils.parseUnits(amountBaseToken, 18),
      pathBuy
    );

    let promisesValue2;
    try {
      promisesValue2 = await Promise.allSettled([
        pairPriceArraySell,
        pairPriceArrayBuy,
      ]);
    } catch (error) {
      console.log(error);
    }
    let sell = promisesValue2[0];
    let buy = promisesValue2[1];

    return {
      sell:
        Number(ethers.utils.formatEther(sell.value[1])) /
        Number(ethers.utils.formatEther(sell.value[0])),
      reserve: pairPrice,
      buy:
        Number(ethers.utils.formatEther(buy.value[0])) /
        Number(ethers.utils.formatEther(buy.value[1])),
    };
  };

  getAllPrices = async (pairs: Pair[], amountBaseToken: string[]) => {
    let exchangesPrices: ExchangePrice[] = [];
    let i = 0;

    for (const pair of pairs) {
      const symbols = pair.symbols;
      const baseToken = pair.baseToken;
      const quoteToken = pair.quoteToken;
      const baseTokenAmount = Number(amountBaseToken[i]);

      exchangesPrices[i] = {
        symbols,
        baseToken,
        baseTokenAmount,
        quoteToken,
        pairs: [],
      };

      for (const singleExchangePair of pair.pairs) {
        let prices: PairPrice;
        try {
          prices = await this.getPairPrice(
            amountBaseToken[i],
            pair.baseToken.address,
            singleExchangePair.address,
            singleExchangePair.exchange.routerAddress
          );
          exchangesPrices[i].pairs.push({
            ...singleExchangePair,
            prices,
          });
        } catch (error) {
          console.log(error);
        }
      }
      i++;
    }

    return exchangesPrices;
  };

  combineDEXtrades = (allPrices: ExchangePrice[]) => {
    for (let i = 0; i < allPrices.length; i++) {
      let pair = allPrices[i];
      allPrices[i].pairs = _.combinations(pair.pairs, 2);
    }

    return allPrices;
  };

  computeProfit = (allPricesComb: ExchangePrice[]) => {
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

          mailgun.messages().send(
            {
              from: 'PRINT BNB <me@samples.mailgun.org>',
              to: ['limol.lionel@gmail.com', 'lorcann@live.fr'],
              subject: 'Hello',
              text: `BUY ${pair.baseToken.symbol} on ${
                result['direction1'].direction[0].exchangeBuy.name
              } and SELL ${pair.quoteToken.symbol} on ${
                result['direction1'].direction[1].exchangeSell.name
              } || profit: ${priceDifDir1 * pair.baseTokenAmount} ${
                pair.quoteToken.symbol
              } || priceDiff: ${priceDifDir1} || Price gotten for baseToken amount: ${
                pair.baseTokenAmount
              }`,
            },
            function (error, body) {
              console.log(body);
            }
          );
        }

        if (priceDifDir2 > 0) {
          console.log('Date now --------', Date.now());
          console.log(
            `BUY ${pair.baseToken.symbol} on ${result['direction2'].direction[0].exchangeBuy.name} and SELL ${pair.quoteToken.symbol} on ${result['direction2'].direction[1].exchangeSell.name}`
          );
          console.log('The price difference -------- ', priceDifDir2);

          mailgun.messages().send(
            {
              from: 'PRINT BNB <me@samples.mailgun.org>',
              to: ['limol.lionel@gmail.com', 'lorcann@live.fr'],
              subject: 'Hello',
              text: `BUY ${pair.baseToken.symbol} on ${
                result['direction2'].direction[0].exchangeBuy.name
              } and SELL ${pair.quoteToken.symbol} on ${
                result['direction2'].direction[1].exchangeSell.name
              } || profit: ${priceDifDir2 * pair.baseTokenAmount} ${
                pair.quoteToken.symbol
              } ${
                pair.quoteToken.symbol
              } || priceDiff: ${priceDifDir2} || Price gotten for baseToken amount: ${
                pair.baseTokenAmount
              }`,
            },
            function (error, body) {
              console.log(body);
            }
          );
        }

        profitComputation.push(result);
      }
      allPricesComb[i].profitComputation = profitComputation;
    }

    return allPricesComb;
  };

  isProfitable = () => {};

  getBiggestProfit = async (isProfitable) => {};
}
