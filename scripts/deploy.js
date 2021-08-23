async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    console.log("Account balance:", (await deployer.getBalance()).toString());
  
    const TomatoCoinICO = await ethers.getContractFactory("TomatoCoinICO");
    const icoContract = await TomatoCoinICO.deploy(deployer.address);
  
    console.log("ICO Contract address:", icoContract.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });