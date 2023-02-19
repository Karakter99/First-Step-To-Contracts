const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let fundme
          let deployer
          let mockV3Aggregator
          let sendValue = ethers.utils.parseEther("1") // BU kod sayesinde 1 Ether degerini alabiliyoruz.
          beforeEach(async function () {
              //deploy FundMe contract here  using hardhat deploy
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              fundme = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("constructor", async function () {
              it("Salam", async function () {
                  const response = await fundme.s_priceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })

          describe("fund", async function () {
              it("Fails if you don`t send enough ETH", async function () {
                  await expect(fundme.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })
              it("Updated the amount funded data structure", async function () {
                  await fundme.fund({ value: sendValue })
                  const response = await fundme.addressToAmountFunder(deployer)
                  assert.equal(response.toString(), sendValue.toString())
              })
              it("Adds funder to array of funders", async function () {
                  await fundme.fund({ value: sendValue })
                  const funder = await fundme.getFunder(0)
                  assert.equal(funder, deployer)
              })
          })

          describe("withdraw", async function () {
              beforeEach(async function () {
                  await fundme.fund({ value: sendValue })
              })

              it("withdraw ETH from a single founder", async function () {
                  const startignFundMeBalance =
                      await fundme.provider.getBalance(fundme.address)
                  const startingDeployerBalance =
                      await fundme.provider.getBalance(deployer)

                  const transcationResponse = await fundme.withdraw()
                  const transcationReceipt = await transcationResponse.wait(1)

                  const { gasUsed, effectiveGasPrice } = transcationReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundme.provider.getBalance(
                      fundme.address
                  )
                  const endingDeployerBalance =
                      await fundme.provider.getBalance(deployer)

                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startignFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("Allows wihtdraq multiple funders", async function () {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundme.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startignFundMeBalance =
                      await fundme.provider.getBalance(fundme.address)
                  const startingDeployerBalance =
                      await fundme.provider.getBalance(deployer)

                  const transcationResponse = await fundme.withdraw()
                  const transcationReceipt = await transcationResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transcationReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundme.provider.getBalance(
                      fundme.address
                  )
                  const endingDeployerBalance =
                      await fundme.provider.getBalance(deployer)

                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startignFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )

                  await expect(fundme.getFunder(0)).to.be.reverted
                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundme.addressToAmountFunder(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
              it("Only Allows Owner to withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  const attackerConnectedContract = await fundme.connect(
                      attacker
                  )
                  await expect(attackerConnectedContract.withdraw()).to.be
                      .reverted
              })

              ///// -------------------------------------------------------------------

              it("Cheaper Withdraw testing", async function () {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundme.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startignFundMeBalance =
                      await fundme.provider.getBalance(fundme.address)
                  const startingDeployerBalance =
                      await fundme.provider.getBalance(deployer)

                  const transcationResponse = await fundme.cheaperWithdraw()
                  const transcationReceipt = await transcationResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transcationReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundme.provider.getBalance(
                      fundme.address
                  )
                  const endingDeployerBalance =
                      await fundme.provider.getBalance(deployer)

                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startignFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )

                  await expect(fundme.getFunder(0)).to.be.reverted
                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundme.addressToAmountFunder(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
          })
      })
