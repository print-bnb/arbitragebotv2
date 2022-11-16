import { ethers } from 'ethers';
import fs from 'fs';
import ABI from '../../constants/abi';
import config from '../../constants/config';
import { BlockchainService } from './BlockchainService';
import { PriceService } from './PriceService';
import pairs, { Pair } from '../pairs';

const { factoryABI, routerABI } = ABI;

const {
  baseTokens,
  quoteTokens,
  factoryAddress,
  routerAddress,
  ZERO_ADDRESS,
  tradingFees,
} = config;

const pairFile = './pairs.json';
const priceService = new PriceService();

export interface ExchangeContract {
  factory: ethers.Contract;
  router: ethers.Contract;
  exchangeName: string;
}

export interface TokenPair {
  symbols: string;
  baseToken: { symbol: string; address: string };
  quoteToken: { symbol: string; address: string };
  pairs: {
    address: string;
    exchange: {
      name: string;
      factoryAddress: string;
      routerAddress: string;
    };
  }[];
}
export class PairService extends BlockchainService {
  constructor() {
    super();
  }

  getAllPairs = (): Pair[] => {
    return pairs;
  };

  updatePairs = async () => {
    let exchangesContracts: ExchangeContract[] = [];

    for (let i = 0; i < Object.keys(factoryAddress).length; i++) {
      const factory = new ethers.Contract(
        factoryAddress[Object.keys(factoryAddress)[i]],
        factoryABI,
        this.provider
      );

      const router = new ethers.Contract(
        routerAddress[Object.keys(routerAddress)[i]],
        routerABI,
        this.provider
      );

      exchangesContracts.push({
        factory,
        router,
        exchangeName: Object.keys(factoryAddress)[i],
      });
    }

    let tokenPairs: TokenPair[] = [];
    for (const key in baseTokens) {
      const baseToken = baseTokens[key];
      for (const quoteKey in quoteTokens) {
        const quoteToken = quoteTokens[quoteKey];
        const symbols = `${baseToken.symbol}-${quoteToken.symbol}`;
        const duplicateSymbols = `${quoteToken.symbol}-${baseToken.symbol}`;

        if (
          quoteToken.symbol === baseToken.symbol ||
          tokenPairs.some((obj) => obj.symbols.includes(duplicateSymbols)) ||
          symbols === 'BUSD-USDT' ||
          symbols === 'USDT-BUSD' ||
          baseToken.symbol === 'USDT' ||
          baseToken.symbol === 'BUSD' ||
          baseToken.symbol === 'USDC'
        )
          continue;

        let tokenPair: TokenPair = {
          symbols,
          baseToken,
          quoteToken,
          pairs: [],
        };
        tokenPair.baseToken.address = ethers.utils.getAddress(
          tokenPair.baseToken.address
        );
        tokenPair.quoteToken.address = ethers.utils.getAddress(
          tokenPair.quoteToken.address
        );

        for (const exchange of exchangesContracts) {
          console.log('-------');
          console.log(`search for ${symbols} on ${exchange.exchangeName}`);

          let pairAddress;
          try {
            pairAddress = await exchange.factory.getPair(
              baseToken.address,
              quoteToken.address
            );
          } catch (error) {
            console.log(error);
          }

          if (pairAddress != ZERO_ADDRESS) {
            console.log(`find ${symbols} on ${exchange.exchangeName}`);
            tokenPair.pairs.push({
              address: pairAddress,
              exchange: {
                name: exchange.exchangeName,
                factoryAddress: exchange.factory.address,
                routerAddress: exchange.router.address,
              },
            });
          } else {
            console.log(`don't find ${symbols} on ${exchange.exchangeName}`);
          }

          if (tokenPair.pairs.length >= 2) {
            tokenPairs.push(tokenPair);
          }
        }
      }
    }

    let tokenPairWithoutDuplicates = [...new Set(tokenPairs)];

    fs.writeFile(
      pairFile,
      JSON.stringify(tokenPairWithoutDuplicates),
      async function (err) {
        if (err) {
          return console.log(err);
        }
        console.log('Pairs file updated!');
      }
    );
  };
}
