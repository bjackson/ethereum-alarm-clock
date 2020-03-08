require("chai")
  .use(require("chai-as-promised"))
  .should()

const { expect } = require("chai")

const PaymentLib = artifacts.require("./PaymentLib.sol")

const toBN = web3.utils.toBN;
const config = require("../../config")

/**
 * Tests the correct calculation of the endowment from PaymentLib.
 * The endowment is the value that must be sent with the scheduling transaction.
 * It covers the amount of ether for:
 *  - payment
 *  - fee
 *  - execution gas
 *  - callGas
 *  - callValue
 */

contract("PaymentLib", () => {
  const { web3 } = config
  let paymentLib

  before(async () => {
    paymentLib = await PaymentLib.deployed()
  })

  it("returns the correct endowment [1/2]", async () => {
    const callGas = toBN(3000000)
    const callValue = toBN(123454321)
    const gasPrice = toBN(web3.utils.toWei("55", "gwei"))
    const fee = toBN(web3.utils.toWei("120", "finney"))
    const bounty = toBN(web3.utils.toWei("250", "finney"))

    const expectedEndowment = bounty
      .add(fee)
      .add(callGas.multipliedBy(gasPrice))
      .add(gasPrice.multipliedBy(180000))
      .add(callValue)

    const endowment = await paymentLib.computeEndowment(
      bounty,
      fee,
      callGas,
      callValue,
      gasPrice,
      180000
    )

    expect(endowment.sub(expectedEndowment).toNumber()).to.equal(0)

    expect(expectedEndowment.toString()).to.equal(endowment.toString())
  })

  it("returns the correct endowment [2/2]", async () => {
    const callGas = toBN(3333331)
    const callValue = toBN(web3.utils.toWei("3", "ether"))
    const gasPrice = toBN(web3.utils.toWei("25", "gwei"))
    const fee = toBN(web3.utils.toWei("2", "ether"))
    const bounty = toBN(web3.utils.toWei("250", "finney"))

    const expectedEndowment = bounty
      .add(fee)
      .add(callGas.multipliedBy(gasPrice))
      .add(gasPrice.multipliedBy(180000))
      .add(callValue)

    const endowment = await paymentLib.computeEndowment(
      bounty,
      fee,
      callGas,
      callValue,
      gasPrice,
      180000
    )

    expect(endowment.sub(expectedEndowment)).to.equal(0)

    expect(expectedEndowment.toString()).to.equal(endowment.toString())
  })
})
