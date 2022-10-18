require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.4",
  networks: {
    hardhat: {
        forking: {
            url: `https://nd-414-816-538.p2pify.com/c97546d94f3fd451c9614306661d5e55`,//"https://eth-mainnet.g.alchemy.com/v2/doXPrC0ipbeazKwRw2baDi0Y8rPkIR94",
            blockNumber: 22153547 //14638929
        },
    },
},
};