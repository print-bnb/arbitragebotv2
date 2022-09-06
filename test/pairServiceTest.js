const { expect } = require('chai');
const PairService = require('../services/PairService');
const assert = require('assert').strict;

describe("Pair Service", () => {

    it("Get Pair Price", async () => {
        const examplePair = "0x531FEbfeb9a61D948c384ACFBe6dCc51057AEa7e";
        const pairService = new PairService();
        const pairPrice = await pairService.getPairPrice(examplePair);
        expect(pairPrice).to.be.a('number');
    });

});