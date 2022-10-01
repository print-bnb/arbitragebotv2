const MyCoin = artifacts.require('MyCoin');
const FlashLoanLender = artifacts.require('FlashLoanLender');
const FlashLoanBorrower = artifacts.require('FlashLoanBorrower');

const {
    BN,
    expectEvent,
    expectRevert,
}  = require('@openzeppelin/test-helpers')
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const { expect } = require('chai');

describe('Flash Loan test', () => {
    let accounts;
    let owner;
    let alice;
    let bob;
    let carole;
    let dave;

    before(async function() {
        this.timeout(15000);

        accounts = await web3.eth.getAccounts();
        owner = accounts[0];
        alice = accounts[1];
        bob = accounts[2];
        carole = accounts[3];
        dave = accounts[4];

        this.erc20 = await MyCoin.new(
        )

        this.lender = await FlashLoanLender.new(
           [this.erc20.address],
           1
        )

        this.borrower = await FlashLoanBorrower.new(
            this.lender.address, 
        )
    })

    describe('Flash Loan Test', function () {
        
        it('Should transfer all tokens to flash lender contract', async function () {
                this.timeout(15000);
                const amount = 1000000000;
                await this.erc20.transfer(this.lender.address, amount);
                const lenderBalanceAfterTransfer = await this.erc20.balanceOf(this.lender.address);
                console.log({lenderBalanceAfterTransfer});
                console.log({amount});
                expect(new BN(lenderBalanceAfterTransfer).toNumber()).to.equal(amount);
        })

        it('Test flash loan', async () => {
            const request = await this.borrower.flashBorrow(this.erc20.address, 1000000000);
            console.log({request});
        })
    });

    
    

})