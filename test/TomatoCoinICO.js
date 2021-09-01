const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { BigNumber } = ethers;

describe("TomatoCoinICO", function () {
    let owner;
    let treasury;
    let guest1;
    let guest2;

    before(async function () {
        this.TomatoCoinICO = await ethers.getContractFactory('TomatoCoinICO');
    });

    beforeEach(async function () {
        [owner, treasury, guest1, guest2] = await ethers.getSigners();
        
        this.ico = await this.TomatoCoinICO.connect(owner).deploy(treasury.getAddress());
        await this.ico.deployed();
    });
    it("Only owner can add private investors who can deposit during seed phase", async function () {
        await expect(this.ico.connect(guest2).addPrivateInvestor(guest1.getAddress()))
            .to.be.revertedWith("Ownable: caller is not the owner");
        await expect(this.ico.connect(owner).addPrivateInvestor(guest1.getAddress()))
            .to.emit(this.ico, 'AddedPrivateInvestor');
    });

    it("Owner can advance phase", async function () {
        await expect(this.ico.connect(guest1).advancePhase()).to.be.reverted;
        await expect(this.ico.advancePhase()).to.emit(this.ico, "PhaseChanged");
        await expect(this.ico.advancePhase()).to.emit(this.ico, "PhaseChanged");
        await expect(this.ico.advancePhase()).to.be.reverted;

    });

    it("Owner can pause and unpause", async function () {
        await expect(this.ico.connect(guest1).pause()).to.be.reverted;
        await expect(this.ico.pause()).to.emit(this.ico, "Paused");
        await expect(this.ico.pause()).to.be.reverted;
        await expect(this.ico.unpause()).to.emit(this.ico, "Unpaused");
        await expect(this.ico.unpause()).to.be.reverted;
    });


    it("test contribution logic", async function () {

        const indLimitSeed = ethers.utils.parseEther("1500");
        const indLimitGeneral = ethers.utils.parseEther("1000");
        const totalLimitSeed = ethers.utils.parseEther("15000")
        const totalLimitGeneral = ethers.utils.parseEther("30000")


        await expect(this.ico.connect(guest1).contribute({ value:100 })).to.be.reverted;
        await expect(this.ico.connect(owner).addPrivateInvestor(guest1.getAddress()))
        .to.emit(this.ico, 'AddedPrivateInvestor');
        expect(await this.ico.totalRaised()).to.equal(0);
        // Only private investors can contribute
        await expect(this.ico.connect(guest1).contribute({ value:100 })).to.emit(this.ico, "Contribute");
        await expect(this.ico.connect(guest1).contribute({ value:indLimitSeed })).to.be.reverted;
        expect(await this.ico.totalRaised()).to.equal(100);

        // Entering General Phase
        await expect(this.ico.advancePhase()).to.emit(this.ico, "PhaseChanged");
        await this.ico.pause()
        await expect(this.ico.connect(guest2).contribute({ value:150 })).to.be.reverted;
        await this.ico.unpause();
        await expect(this.ico.connect(guest2).contribute({ value:150 })).to.emit(this.ico, "Contribute");
        await expect(this.ico.connect(guest1).contribute({ value:indLimitGeneral })).to.be.reverted;
        expect(await this.ico.totalRaised()).to.equal(250);

        await expect(this.ico.advancePhase()).to.emit(this.ico, "PhaseChanged"); // Open Phase
        await expect(this.ico.connect(guest1).contribute({ value:indLimitGeneral })).to.emit(this.ico, "Contribute")
        .withArgs(guest1.address, indLimitGeneral);
        expect(await this.ico.totalRaised()).to.equal("1000000000000000000250");

    });

    it("anyone can deposit during open phase, and withdraw tokens", async function () {
        // Move phase to Open
        await expect(this.ico.advancePhase()).to.emit(this.ico, "PhaseChanged");
        await expect(this.ico.connect(guest2).contribute({ value:150 })).to.emit(this.ico, "Contribute");
        await expect(this.ico.advancePhase()).to.emit(this.ico, "PhaseChanged");
        await expect(this.ico.connect(guest1).contribute({ value:100 })).to.emit(this.ico, "Contribute");

        await expect(this.ico.connect(guest1).redeemTomatoCoin()).to.emit(this.ico, "RedeemedCoins");
        const TomatoCoin = await ethers.getContractFactory("TomatoCoin");
        const coin = await TomatoCoin.attach(await this.ico.getTomatoCoin());
        expect(await coin.balanceOf(guest1.address)).to.equal(500);

    });

    it("test whether funds can be withdrawn", async function () {
        
        await expect(this.ico.connect(guest1).withdraw(treasury.address, 50)).to.be.reverted;
        await expect(this.ico.advancePhase()).to.emit(this.ico, "PhaseChanged");
        await expect(this.ico.connect(guest2).contribute({ value:150 })).to.emit(this.ico, "Contribute");
        await expect(this.ico.advancePhase()).to.emit(this.ico, "PhaseChanged");
        await expect(this.ico.connect(guest1).contribute({ value:100 })).to.emit(this.ico, "Contribute");
        const treasuryBalanceInit = await ethers.provider.getBalance(treasury.address);
        await expect(this.ico.withdraw(treasury.address, 50)).to.emit(this.ico, 'Withdraw');
        const treasuryBalanceFinal = await ethers.provider.getBalance(treasury.address);
        expect(treasuryBalanceFinal).to.equal(treasuryBalanceInit.add(50));
        
    })


});