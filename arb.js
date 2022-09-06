const Web3 = require("web3");
const { toWei, fromWei } = require("web3-utils");
const { baseTokens, quoteTokens, factoryAddress } = require("./constants/config");
const { ethers } = require('hardhat');

const lodash = require('lodash');
const fs = require('fs');
const { get } = require("lodash");

 //provider
const provider = new ethers.providers.JsonRpcProvider(
  "https://bsc-dataseed.binance.org"
);

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const pairFile = "./pairs.json";

// updates all pairs and writes them to a json file
const updatePairs = async () => {
    const factoryAbi = ['function getPair(address, address) view returns (address pair)'];
    let factories = [];
    for (const key in factoryAddress) {
        const addr = factoryAddress[key];
        const factory = new ethers.Contract(addr, factoryAbi, provider);
        factories.push({
          contract: factory,
          exchange: key
        });
    }

    let tokenPairs = [];
    for (const key in baseTokens) {
        const baseToken = baseTokens[key];
        console.log({baseToken});

        for (const quoteKey in quoteTokens) {
          const quoteToken = quoteTokens[quoteKey];
          let tokenPair = { symbols: `${quoteToken.symbol}-${baseToken.symbol}`, pairs: [] };

          for (const factory of factories) {
            const pair = await factory.contract.getPair(baseToken.address, quoteToken.address);

            if (pair != ZERO_ADDRESS) {
              tokenPair.pairs.push({
                address: pair,
                exchange: factory.exchange
              });
            }
          }
          if (tokenPair.pairs.length >= 2) {
            tokenPairs.push(tokenPair);
          }
        }
    }

    let allPairs = [];
    for (const tokenPair of tokenPairs) {
      if (tokenPair.pairs.length < 2) {
        continue;
      } else if (tokenPair.pairs.length == 2) {
        allPairs.push(tokenPair);
      } else {
        const combinations = lodash.combinations(tokenPair.pairs, 2);
        console.log({combinations})
        for (const pair of combinations) {
          const arbitragePair = {
            symbols: tokenPair.symbols,
            pairs: pair,
          };
          allPairs.push(arbitragePair);
        }
      }
    }

    fs.writeFile(pairFile, JSON.stringify(allPairs), async function (err) {
      if (err) {
          return console.log(err);
      }
      console.log("Pairs file updated!");

    }); 

    return allPairs;
}

// identify opportunites from array of pairs => use getAllPairs()
const identifyOpportunities = async (pairs) => {
  const fee = 0.05010020040080576;

  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    const symbols = pair.symbols;
    let exchange = [];
    
    for (let j = 0; j < pair.pairs.length; j++) {
      const exchangeName = pair.pairs[j].exchange;
      const pairPrice = await getPairPrice(pair.pairs[j].address);

      exchange.push({
        price: pairPrice,
        name: exchangeName
      })

      console.log(`${symbols} on ${exchangeName} : ${pairPrice}`);
    }

    // get exchange in and out
    exchange.sort(compare);
    console.log(`We are going to BUY on ${exchange[0].name} to SELL on ${exchange[1].name}`);

    // calculate net profit
    const profit = calculateNetProfit(exchange[1].price, exchange[0].price, fee)

    console.log(`This trade is profitable ? ${profit > 0 ? "YES" : "NO"}`);
    console.log(`Profit: ${profit.toFixed(2)}$`);
    console.log('-------------');
  }

  return pairs;
}

// get all pairs from json file
const getAllPairs = async () => {
  let pairs = [] ;
  try {
    pairs = JSON.parse(fs.readFileSync(pairFile, 'utf-8'));
  } catch (err) {
    pairs = null;
  }

  return pairs;
}

// get pair price from pair address
const getPairPrice = async (address) => {
   const ABI = [
    "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  ];

  const pool = new ethers.Contract(
    address,
    ABI,
    provider
  );

  const poolReserves = await pool.getReserves();
  const token01 = Number(poolReserves.reserve0._hex);
  const token02 = Number(poolReserves.reserve1._hex);
  const price = token02 / token01;

  return price;
}

// calculate net profit with fee
const calculateNetProfit = (priceA, priceB, fee) => {
  return priceA - priceB - fee; 
}

// function to sort array by price
const compare = (a, b) => {
  if ( a.price < b.price ){
    return -1;
  }
  if ( a.price > b.price ){
    return 1;
  }
  return 0;
}

const startArbitrage = async () => {
  const pairs = await getAllPairs();
  identifyOpportunities(pairs);
}

startArbitrage();