export interface DEX {
  name: string;
  factoryAddress: string;
  routerAddress: string;
}
export interface Pair__pair {
  address: string;
  exchange: DEX;
}
export interface Pair {
  symbols: string;
  baseToken: {
    symbol: string;
    address: string;
  };
  quoteToken: {
    symbol: string;
    address: string;
  };
  pairs: Pair__pair[];
}

import pairsJson from '../pairs.json';
const PAIRS: Pair[] = pairsJson;

export default PAIRS;
