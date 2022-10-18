const FlashLoanBorrower = artifacts.require('FlashLoanBorrower');
const FlashLoanLender = artifacts.require('FlashLoanLender');
const MyCoin = artifacts.require('MyCoin');
// const Payment = artifacts.require('Payment');
// const FlashLoanBorrower = artifacts.require('FlashLoanBorrower');

module.exports = async (deployer, network, [defaultAccount]) => {
  await deployer.deploy(MyCoin);
  await deployer.deploy(FlashLoanLender, [MyCoin.address], 1);
  await deployer.deploy(FlashLoanBorrower, FlashLoanLender.address);
  // await deployer.deploy(PrintBNB, Payment.address);
}