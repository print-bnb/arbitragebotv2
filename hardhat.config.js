require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.6.6",
  networks: {
  	rinkeby: {
  		url: `https://eth-rinkeby.alchemyapi.io/v2/7T_yio27uiRCnwImwR7LeZfosXF0eONl`,
  		accounts: {
        mnemonic: "",
      },
  	}
  }
};
