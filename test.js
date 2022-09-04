const ethers = require("ethers");

const addresses = {
  USDT: "0x55d398326f99059fF775485246999027B3197955",
  WBNB: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
  PCS_factory: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
  PCS_router: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
  PCS_pair: "0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE",
  BS_deployer: "0x858E3312ed3A876947EA49d572A7C42DE08af7EE",
  BS_oracle: "0x2f48cde4cfd0fb4f5c873291d5cf2dc9e61f2db0",
  BS_router: "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8",
  BS_pair: "0x8840C6252e2e86e545deFb6da98B2a0E26d8C1BA",
  recipient: "0xF017E033EC71A82ef62a213A34E72BC0F278548f",
};

const tradingFees = {
  pancake : 0.25,
  biswap : 0.2
}

//provider
const provider = new ethers.providers.JsonRpcProvider(
  "https://bsc-dataseed.binance.org"
);

//contract instances
const ABI = [
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
];

const PCSPairSmartcontract = new ethers.Contract(
  addresses.PCS_pair,
  ABI,
  provider
);

const BSPairSmartcontract = new ethers.Contract(
  addresses.BS_pair,
  ABI,
  provider
);


const getPrice = async () => { 

  let start = Date.now()
  let quotations = {}
  let exchanges = ["pancake", "biswap"]

  let PCprice = PCSPairSmartcontract.getReserves();
  let BSprice = BSPairSmartcontract.getReserves();

  let results = await Promise.allSettled([PCprice, BSprice])

  for(let i=0; i < results.length; i++){
    const token0 = Number(results[i].value.reserve0._hex);
    const token1 = Number(results[i].value.reserve1._hex);
    quotations[exchanges[i]] = token0 / token1;
  }

  // price of 
  console.log(quotations)
  let condition = 0.05010020040080576 < (100*Math.abs(quotations["pancake"]-quotations["biswap"])/Math.max(quotations["pancake"],quotations["biswap"]))
  console.log(condition)
  console.log("------duration", Date.now()-start)
}

getPrice();