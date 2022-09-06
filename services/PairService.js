const { ethers } = require('hardhat');
const lodash = require('lodash');
const fs = require('fs');

// CONSTANTS
const { getReservesABI, factoryABI } = require('../constants/abi.js');
const { baseTokens, quoteTokens, factoryAddress } = require("../constants/config");
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const pairFile = "./pairs.json";

// SERVICES
const Provider = require('./Provider.js');
const PriceService = require('./PriceService.js');

class PairService extends Provider {

    constructor() {
        super();
    } 
  
    // get all pairs from json file
    getAllPairs = async () => {
        let pairs = [] ;
        try {
            pairs = JSON.parse(fs.readFileSync(pairFile, 'utf-8'));
        } catch (err) {
            pairs = null;
        }

        return pairs;
    }
    
    // get pair price from pair address
    getPairPrice = async (address) => {
        if(address) {
            
            const pool = new ethers.Contract(
            address,
            getReservesABI,
            this.provider
            );
        
            const poolReserves = await pool.getReserves();
            const token01 = Number(poolReserves.reserve0._hex);
            const token02 = Number(poolReserves.reserve1._hex);
            const price = token02 / token01;
            
            return price;
        }

        return null;
    }

    updatePairs = async () => {
        let factories = [];
        for (const key in factoryAddress) {
            const addr = factoryAddress[key];
            const factory = new ethers.Contract(addr, factoryABI, this.provider);
            factories.push({
              contract: factory,
              exchange: key
            });
        }
    
        let tokenPairs = [];
        for (const key in baseTokens) {
            const baseToken = baseTokens[key];
            for (const quoteKey in quoteTokens) {
                const quoteToken = quoteTokens[quoteKey];
                const symbols = `${quoteToken.symbol}-${baseToken.symbol}`;
                let tokenPair = { symbols, pairs: [] };

                for (const factory of factories) {
                    console.log("-------");
                    console.log(`search for ${symbols} on ${factory.exchange}`);
                    // try {
                        const pair = await factory.contract.getPair(baseToken.address, quoteToken.address);
                        if (pair != ZERO_ADDRESS) {
                            console.log(`find ${symbols} on ${factory.exchange}`);
                            tokenPair.pairs.push({
                                address: pair,
                                exchange: factory.exchange
                            });
                        }
                    // } catch (error) {
                        if (tokenPair.pairs.length >= 2) {
                            // console.log(`don't find ${symbols} on ${factory.exchange}`);
                            tokenPairs.push(tokenPair);
                        }
                    // }
                }
            }

        }
    
        // let allPairs = [];
        // for (const tokenPair of tokenPairs) {
        //   if (tokenPair.pairs.length < 2) {
        //     continue;
        //   } else if (tokenPair.pairs.length == 2) {
        //     allPairs.push(tokenPair);
        //   } else {
        //     const combinations = lodash.combinations(tokenPair.pairs, 2);
        //     console.log({combinations})
        //     for (const pair of combinations) {
        //       const arbitragePair = {
        //         symbols: tokenPair.symbols,
        //         pairs: pair,
        //       };
        //       allPairs.push(arbitragePair);
        //     }
        //   }
        // }
        console.log({tokenPairs})
    
        fs.writeFile(pairFile, JSON.stringify(tokenPairs), async function (err) {
          if (err) {
              return console.log(err);
          }
          console.log("Pairs file updated!");
        }); 
    }

    // function to sort array by price
    compare = (a, b) => {
        if ( a.price < b.price ){
            return -1;
        }
        if ( a.price > b.price ){
            return 1;
        }
        return 0;
    }
    
    // identify opportunites from array of pairs => use getAllPairs()
    identifyOpportunities = async (pairs) => {
        const fee = 0.05010020040080576;
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i];
            const symbols = pair.symbols;
            let exchange = [];
        
            for (let j = 0; j < pair.pairs.length; j++) {
            const exchangeName = pair.pairs[j].exchange;
            const pairPrice = await this.getPairPrice(pair.pairs[j].address);
        
            exchange.push({
                price: pairPrice,
                name: exchangeName
            })
        
            console.log(`${symbols} on ${exchangeName} : ${pairPrice}`);
            }
        
            // get exchange in and out
            exchange.sort(this.compare);
            console.log(`We are going to BUY on ${exchange[0].name} to SELL on ${exchange[exchange.length-1].name}`);
        
            // calculate net profit
            const priceService = new PriceService(fee);
            const profit = await priceService.calculateNetProfit(exchange[1].price, exchange[0].price)

            console.log(`This trade is profitable ? ${profit > 0 ? "YES" : "NO"}`);
            console.log(`Profit: ${profit}$`);
            console.log('-------------');
        }
    }
  
}

module.exports = PairService;
