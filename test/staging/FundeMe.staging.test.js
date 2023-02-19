const { ethers, getNamedAccounts, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert } = require("chai")

/* Su koddaki soru isareti bir if yali isleya
  a) Yani let var someVar = Var ? "Yes" :"No"; 
  Yani eger var evet bolsa su yes kismini yap 
  Egerde No bo 
*/

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let fundme
          let deployer
          let sendValue = ethers.utils.parseEther("1")
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployers
              fundme = await ethers.getContract("FundMe", deployer)
          })

          it("Allows people Fund and Withdraw", async function () {
              await fundme.fund({ value: sendValue })
              await fundme.withdraw()
              const endingBalance = await fundme.provider.getBalance(
                  fundme.address
              )
              assert.equal(endingBalance.toString(), "0")
          })
      })
