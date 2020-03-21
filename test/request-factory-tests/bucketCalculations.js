require("chai")
  .use(require("chai-as-promised"))
  .use(require('chai-bn')(web3.utils.BN))
  .should();

const { expect } = require("chai");
const { calculateTimestampBucket, calculateBlockBucket } = require("../dataHelpers");

const { toBN } = web3.utils;

// Contracts
const RequestFactory = artifacts.require("./RequestFactory.sol");
const TransactionRequestCore = artifacts.require("./TransactionRequestCore.sol");

// Note - these tests were checked very well and should never be wrong.
// If they start failing - look in the contracts.
contract("Request factory", async () => {
  describe("getBucket()", async () => {
    let transactionRequestCore;
    let requestFactory;

    before(async () => {
      transactionRequestCore = await TransactionRequestCore.deployed();
      requestFactory = await RequestFactory.new(transactionRequestCore.address);
    });

    it("should calculate bucket for timestamp", async () => {
      const now = toBN(1522825648);
      const bucket = await requestFactory.getBucket(now, 2);
      const expected = calculateTimestampBucket(now);

      expect(bucket).to.bignumber.equals(expected);
    });

    it("should calculate bucket for max timestamp", async () => {
      const intMax = toBN(2).pow(toBN(255)).subn(1);
      const now = toBN(2).pow(toBN(256)).subn(1);
      const bucket = await requestFactory.getBucket(now, 2);

      const expected = intMax.addn(1).muln(-2).add(calculateTimestampBucket(now)); // overflows
      // FIXME: Should the `fromTwos` be somewhere else?
      expect(bucket.toString()).to.equals(expected.fromTwos(256).toString());
    });

    it("should calculate bucket for block", async () => {
      const now = toBN(6709534);
      const bucket = await requestFactory.getBucket(now, 1);
      const expected = calculateBlockBucket(now);

      expect(bucket.toString()).to.equals(expected.fromTwos(256).toString());
    });
  });
});
