const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { BigNumber } = ethers;

describe("FruitSwap Liquidity pool tests", function () {
    let owner;
    let treasury;
    let guest1;
    let guest2;

    before(async function () {
        this.TomatoCoin = await ethers.getContractFactory('TomatoCoin');
        this.TomatoCoinICO = await ethers.getContractFactory('TomatoCoinICO');
        this.FruitSwap = await ethers.getContractFactory('FruitSwap');
        this.FruitToken = await ethers.getContractFactory('FruitToken');
    });

    beforeEach(async function () {
        [owner, treasury, guest1, guest2] = await ethers.getSigners();

        // deployed coin contract
        this.coin = await this.TomatoCoin.deploy(owner.getAddress(), treasury.getAddress());
        await this.coin.deployed();

        // deployed ICO Contract
        this.ico = await this.TomatoCoinICO.connect(owner).deploy(treasury.getAddress());
        await this.ico.deployed();
        await this.ico.advancePhase();
        await this.ico.advancePhase();
        await this.ico.connect(guest2).contribute({ value:150000000000 });
        await this.ico.connect(guest1).contribute({ value:150000000000 });
        await this.ico.withdraw(treasury.address, 250000000000);

        // deployed LP contract
        this.lp = await this.FruitSwap.deploy(this.coin.address);
        await this.lp.deployed();
        this.token = this.FruitToken.attach(await this.lp.getToken());


    });

    it("test the starting allocation", async function () {
        expect(await this.coin.balanceOf(treasury.address)).to.equal("150000000000000000000000");
    });

    it("test adding liquidity", async function () {
        await this.coin.connect(treasury).transfer(this.lp.address, 150000000000);
        const lpAddress = this.lp.address;
        const transaction1 = await owner.sendTransaction(
            {
                to: lpAddress,
                value: 150000000000
            });
        expect(await ethers.provider.getBalance(lpAddress)).to.equal(150000000000);
        expect(await this.token.balanceOf(treasury.address)).to.equal(0);
        await this.lp.connect(treasury).addLiquidity(treasury.address);
        expect(await this.token.balanceOf(treasury.address)).to.equal(150000000000);
        await this.coin.connect(treasury).transfer(this.lp.address, 100000000000);
        const transaction2 = await owner.sendTransaction(
            {
                to: lpAddress,
                value: 100000000000
            });
        expect(await this.token.balanceOf(treasury.address)).to.equal(150000000000);
        await this.lp.connect(treasury).addLiquidity(treasury.address);
        expect(await this.token.balanceOf(treasury.address)).to.equal(250000000000);

    });

    it("test remove liquidity", async function () {
        let amount0;
        let amount1;
        await this.coin.connect(treasury).transfer(this.lp.address, 150000000000);
        const lpAddress = this.lp.address;
        const transaction1 = await treasury.sendTransaction(
            {
                to: lpAddress,
                value: 150000000000
            });
        expect(await ethers.provider.getBalance(lpAddress)).to.equal(150000000000);
        expect(await this.token.balanceOf(treasury.address)).to.equal(0);
        await this.lp.addLiquidity(treasury.address);
        expect(await this.token.balanceOf(treasury.address)).to.equal(150000000000);
        
        await this.token.connect(treasury).transfer(lpAddress, 100000000000);
        const initial = await ethers.provider.getBalance(treasury.address);
        const initialTomato = await this.coin.balanceOf(treasury.address);
        await this.lp.removeLiquidity(treasury.address);
        expect(await this.coin.balanceOf(treasury.address)).to.equal(initialTomato.add(100000000000));;
        expect(await ethers.provider.getBalance(treasury.address)).to.equal(initial.add(100000000000));

    });


    it("test swapping eth for token", async function () {
        // add liquidity

        await this.coin.connect(treasury).transfer(this.lp.address, 150000000000);
        const lpAddress = this.lp.address;
        const transaction1 = await treasury.sendTransaction(
            {
                to: lpAddress,
                value: 150000000000
            });
        expect(await ethers.provider.getBalance(lpAddress)).to.equal(150000000000);
        expect(await this.token.balanceOf(treasury.address)).to.equal(0);
        await this.lp.connect(treasury).addLiquidity(treasury.address);
        expect(await this.token.balanceOf(treasury.address)).to.equal(150000000000);

        // swap eth for tomato
        const transaction2 = await treasury.sendTransaction(
            {
                to: lpAddress,
                value: 10000000000
            });   
        const initialTomato = await this.coin.balanceOf(treasury.address);    
        const val = await this.lp.swapETHForToken(treasury.address, 10000000000);
        expect(initialTomato.lt(await this.coin.balanceOf(treasury.address)));   

    });

    it("test swapping token for eth", async function () {
        // add liquidity

        await this.coin.connect(treasury).transfer(this.lp.address, 150000000000);
        const lpAddress = this.lp.address;
        const transaction1 = await treasury.sendTransaction(
            {
                to: lpAddress,
                value: 150000000000
            });
        expect(await ethers.provider.getBalance(lpAddress)).to.equal(150000000000);
        expect(await this.token.balanceOf(treasury.address)).to.equal(0);
        await this.lp.connect(treasury).addLiquidity(treasury.address);
        expect(await this.token.balanceOf(treasury.address)).to.equal(150000000000);

        //swap tomato for eth
        await this.coin.connect(treasury).transfer(this.lp.address, 1000000000);
        const initialEth = await ethers.provider.getBalance(treasury.address);    
        await this.lp.swapTokenForETH(treasury.address, 1000000000);
        expect(initialEth.lt(await ethers.provider.getBalance(treasury.address)));  ;    

    });

});