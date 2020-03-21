require("chai")
  .use(require("chai-as-promised"))
  .use(require('chai-bn')(web3.utils.BN))
  .should();
const { expect } = require("chai");

const { waitUntilBlock } = require("@digix/tempo")(web3);

const config = require("../../config");

const { toBN } = config.web3.utils;


const BlockScheduler = artifacts.require("./BlockScheduler.sol");
const RequestFactory = artifacts.require("./RequestFactory.sol");
const TransactionRequestCore = artifacts.require("./TransactionRequestCore.sol");
const TransactionRequestInterface = artifacts.require("./TransactionRequestInterface");
const RecurringPayment = artifacts.require("./RecurringPayment.sol");

const getBalance = async (address) => parseInt(await config.web3.eth.getBalance(address), 10);
const execute = async (recurringPayment, paymentInterval, miner) => {
  const scheduledTransactionAddress = await recurringPayment.currentScheduledTransaction();

  const currentBlock = toBN(await config.web3.eth.getBlockNumber());
  await waitUntilBlock(0, currentBlock.add(paymentInterval).toNumber());

  const scheduledTransaction = TransactionRequestInterface.at(scheduledTransactionAddress);
  await scheduledTransaction.execute({ from: miner, gas: 3000000, gasPrice: 20000000000 });

  const nextScheduledTransactionAddress = await recurringPayment.currentScheduledTransaction();

  expect(nextScheduledTransactionAddress).to.not.equals(scheduledTransactionAddress);
};

contract("Recurring payments", (accounts) => {
  it("should schedule and execute recurring payments transaction", async () => {
    const transactionRequestCore = await TransactionRequestCore.deployed();

    const requestFactory = await RequestFactory.new(transactionRequestCore.address);
    const blockScheduler = await BlockScheduler.new(
      requestFactory.address,
      "0xecc9c5fff8937578141592e7E62C2D2E364311b8"
    );

    const paymentInterval = toBN(50);
    const paymentValue = toBN(10).pow(toBN(17)); // 0.1 ETH
    let numberOfIntervals = toBN(3);
    const expectedPayout = numberOfIntervals.mul(paymentValue);
    const recipient = accounts[1];
    const miner = accounts[2];

    // * 2 to cover scheduling cost, fixed in smart contract to 0.1 ETH
    const totalPayment = numberOfIntervals.mul(paymentValue).muln(2);

    const recurringPayment = await RecurringPayment.new(
      blockScheduler.address,
      paymentInterval,
      paymentValue,
      recipient,
      { value: totalPayment }
    );

    const recipientBalance = await getBalance(recipient);
    /* eslint no-plusplus: "off" */
    /* eslint no-await-in-loop: "off" */
    while (numberOfIntervals > 0) {
      await execute(recurringPayment, paymentInterval, miner);
      numberOfIntervals = numberOfIntervals.subn(1);
    }

    const recipientBalanceAfter = await getBalance(recipient);
    expect(recipientBalanceAfter).to.equals(recipientBalance.add(expectedPayout));
  });
});
