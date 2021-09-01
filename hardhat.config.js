require("@nomiclabs/hardhat-waffle");
// Go to https://www.alchemyapi.io, sign up, create
// a new App in its dashboard, and replace "KEY" with its key
const ALCHEMY_API_KEY = "https://eth-rinkeby.alchemyapi.io/v2/4Nfc6gWmOTNNuacLxa8jFpXDj-VcgFvq";

// Replace this private key with your Ropsten account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Be aware of NEVER putting real Ether into testing accounts
const RINKEBY_PRIVATE_KEY = "7019f41da859ae8234d8ce6cee94cc92b0f60aa6d9eed433474082cffcd1e084";

module.exports = {
  solidity: "0.8.7",
  networks: {
    rinkeby: {
      url: `${ALCHEMY_API_KEY}`,
      accounts: [`0x${RINKEBY_PRIVATE_KEY}`],
    },
  },
};