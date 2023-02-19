const { version } = require("chai")
require("@nomicfoundation/hardhat-toolbox")
require("solhint")
require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")

const goerli_roc_url = process.env.GOERLI_RPC_URL
const private_key = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKETCUP_API_KEY = process.env.COINMARKETCUP_API

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        compilers: [{ version: "0.8.7" }, { version: "0.6.6" }],
    },
    defaultNetwork: "hardhat",
    networks: {
        //Bu asagidaki goerli kod bloguyla biz goerli sana test coinimizi bagliyoruz contractla
        goerli: {
            url: goerli_roc_url,
            accounts: [private_key],
            chainId: 5,
            blockConfirmations: 6,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas_report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCUP_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        user: {
            default: 1,
        },
    },
}
