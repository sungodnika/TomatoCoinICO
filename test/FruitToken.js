const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = ethers;

describe("FruitToken Tests", function () {
    let owner;
    let guest1;
    let guest2;

    before(async function () {
      this.FruitToken = await ethers.getContractFactory('FruitToken');
    });

    beforeEach(async function () {
        [owner, guest1] = await ethers.getSigners();

        this.coin = await this.FruitToken.deploy(owner.getAddress());
        await this.coin.deployed();
      });
    
    it("test minting", async function () {
        await expect(this.coin.connect(guest1).mint(guest1.address, 1000)).to.be.reverted;
        await this.coin.mint(guest1.address, 1000);
        expect(await this.coin.balanceOf(guest1.address)).to.eq(1000);
    });

    it("test burning", async function () {
        await this.coin.mint(guest1.address, 1000);
        expect(await this.coin.balanceOf(guest1.address)).to.eq(1000);
        await expect(this.coin.connect(guest1).burn(guest1.address, 1000)).to.be.reverted;
        await this.coin.burn(guest1.address, 1000);
        expect(await this.coin.balanceOf(guest1.address)).to.eq(0);
    });

})
