const Web3 = require("web3");
const { toWei, fromWei } = require("web3-utils");
const { baseTokens, quoteTokens, factoryAddress } = require("./constants/config");
const { ethers } = require('hardhat');

const lodash = require('lodash');

const abi = [
  {
    name: "getAmountsOut",
    type: "function",
    inputs: [
      {
        name: "amountIn",
        type: "uint256",
      },
      { name: "path", type: "address[]" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
];

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const getPriceFromExchange = () => {
    //provider
    const provider = new ethers.providers.JsonRpcProvider(
        "https://bsc-dataseed.binance.org"
    );
  
    const factoryAbi = ['function getPair(address, address) view returns (address pair)'];
    let factories = [];

    for (const key in factoryAddress) {
        const addr = factoryAddress[key];
        const factory = new ethers.Contract(addr, factoryAbi, provider);
        factories.push(factory);
    }

    let tokenPairs = [];
    for (const key in baseTokens) {
        const baseToken = baseTokens[key];
        console.log({baseToken});

        for (const quoteKey in quoteTokens) {
          const quoteToken = quoteTokens[quoteKey];
          let tokenPair = { symbols: `${quoteToken.symbol}-${baseToken.symbol}`, pairs: [] };
          console.log({quoteToken});
          console.log({tokenPair});

          for (const factory of factories) {
            // console.log({factory})
            const pair = await factory.getPair(baseToken.address, quoteToken.address);
            if (pair != ZERO_ADDRESS) {
              tokenPair.pairs.push(pair);
            }
          }
          if (tokenPair.pairs.length >= 2) {
            tokenPairs.push(tokenPair);
          }
        }
    }
    console.log({tokenPairs})

    let allPairs = [];
    for (const tokenPair of tokenPairs) {
      if (tokenPair.pairs.length < 2) {
        continue;
      } else if (tokenPair.pairs.length == 2) {
        allPairs.push(tokenPair);
      } else {
        const combinations = lodash.combinations(tokenPair.pairs, 2);
        for (const pair of combinations) {
          const arbitragePair = {
            symbols: tokenPair.symbols,
            pairs: pair,
          };
          allPairs.push(arbitragePair);
        }
      }
    }

    console.log(allPairs[0].pairs)
}

getPriceFromExchange();

// get price tokenA/tokenB from router
const getPriceFromRouter = (router, tokenA, tokenB) => {
    const dexRouter = new web3.eth.Contract(
        abi,
        router
    );

    const getTokenExchangeRate = async (tokenA, tokenB) => {
        return (
          await dexRouter.methods.getAmountsOut(toWei("1"), [tokenA, tokenB]).call()
        )[1];
      };
      
      // usage
      const price = await getTokenExchangeRate(tokenA, tokenB)
      console.log({price});

      return price;
}
 