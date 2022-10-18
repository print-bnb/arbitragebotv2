
const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { BigNumber } = require("ethers")
const helpers = require("@nomicfoundation/hardhat-network-helpers");

const ERC20ABI = require("@uniswap/v2-core/build/ERC20.json").abi;
const testNetwork = "BSC";

describe("Flash Swap Test", function () {
    this.timeout(20000);

    const swapper = {
        "BSC" : "0x4d37f2A705377ac4C0827B79A8A4B84267b03Ea1",
        "ETH" : "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE" 
    }

    const tokenA = {
        "BSC" : "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
        "ETH" : "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"// USDC
    }

    const tokenB = {
        "BSC" : "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", // BTBC
        "ETH" : "0xdAC17F958D2ee523a2206206994597C13D831ec7" // USDT
    }

    const borrowAmount = 1000000000; // 1000

    before(async () => {

        console.log("The current block number is", await helpers.time.latestBlock());
        const TestFlashSwapFactory = await ethers.getContractFactory("Swap");
        this.TestFlashSwapContract = await TestFlashSwapFactory.deploy();
        await this.TestFlashSwapContract.deployed();

    });

    it("Flash swap", async () => {
        // console.log("Current block number:", await helpers.time.latestBlock());
        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [swapper[testNetwork]],
        });
        const impersonateSigner = await ethers.getSigner(swapper[testNetwork]);
        const tokenAContract = new ethers.Contract(tokenA[testNetwork], ERC20ABI, impersonateSigner)
        const swapperBalance = await tokenAContract.balanceOf(impersonateSigner.address)
        console.log(`Swapper Balance: ${swapperBalance}`)
        
        const fee = Math.round(((borrowAmount * 3) / 997)) + 1;
        await tokenAContract.connect(impersonateSigner).transfer(this.TestFlashSwapContract.address, fee)
        
        const TestFlashSwapContractBalanceBefore = await tokenAContract.balanceOf(this.TestFlashSwapContract.address)

        expect(Number(TestFlashSwapContractBalanceBefore)).to.equal(fee);
        await this.TestFlashSwapContract.testFlashSwap(tokenAContract.address, tokenB[testNetwork], borrowAmount)
        const TestFlashSwapContractBalanceAfter = await tokenAContract.balanceOf(this.TestFlashSwapContract.address)

        expect(TestFlashSwapContractBalanceAfter.eq(BigNumber.from("0"))).to.be.true;
    })
})