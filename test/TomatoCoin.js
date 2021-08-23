const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = ethers;

describe("TomatoCoin Tests", function () {
    let owner;
    let treasury;
    let guest1;
    let guest2;

    before(async function () {
      this.TomatoCoin = await ethers.getContractFactory('TomatoCoin');
    });

    beforeEach(async function () {
        [owner, treasury, guest1, guest2] = await ethers.getSigners();

        this.coin = await this.TomatoCoin.deploy(owner.getAddress(), treasury.getAddress());
        await this.coin.deployed();
      });
    
    it("test the starting allocation", async function () {
        expect(await this.coin.balanceOf(treasury.address)).to.equal("50000000000000000000000");
    });
    it("test minting", async function () {
        await this.coin.mint(owner.address, 1000);
        await this.coin.transfer(guest1.address, 500);
        expect(await this.coin.balanceOf(owner.address)).to.eq(500);
        expect(await this.coin.balanceOf(guest1.address)).to.eq(500);
        expect(await this.coin.balanceOf(treasury.address)).to.equal("50000000000000000000000");
    });

    it("test tax transfers", async function () {
        await this.coin.mint(owner.address, 1000);
        await this.coin.setTaxable(true);
        await this.coin.transfer(guest1.address, 500);
        expect(await this.coin.balanceOf(owner.address)).to.eq(500);
        expect(await this.coin.balanceOf(guest1.address)).to.eq(490);
        expect(await this.coin.balanceOf(treasury.address)).to.equal("50000000000000000000010");

    });

    it("test only owner can set taxable", async function () {
        await expect(this.coin.connect(treasury).setTaxable(true)).to.be.reverted;
    });

})
