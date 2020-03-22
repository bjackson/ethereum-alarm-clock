require("chai")
  .use(require("chai-as-promised"))
  .use(require('chai-bn')(web3.utils.BN))
  .should();

const { expect } = require("chai");

// Contracts
const TransactionRecorder = artifacts.require("./TransactionRecorder.sol");
const TransactionRequestCore = artifacts.require("./TransactionRequestCore.sol");

const { waitUntilBlock } = require("@digix/tempo")(web3);

// Brings in config.web3 (v1.0.0)
const config = require("../../config");
const { RequestData, parseAbortData, wasAborted } = require("../dataHelpers.js");


const { toBN } = web3.utils;


contract("Timestamp reserved window", async (accounts) => {
  // 1
  it("should reject execution if claimed by another", async () => {
    const MINUTE = toBN(60); // seconds
    const HOUR = toBN(60).mul(MINUTE);
    const DAY = toBN(24).mul(HOUR);

    const txRecorder = await TransactionRecorder.new();
    expect(txRecorder.address).to.exist;

    const block = await config.web3.eth.getBlock("latest");
    const { timestamp } = block;

    const windowStart = toBN(timestamp + DAY);
    const executionWindow = MINUTE.muln(2);
    const freezePeriod = MINUTE.muln(2);
    const claimWindowSize = MINUTE.muln(5);
    const reservedWindowSize = MINUTE.muln(1);

    const gasPrice = config.web3.utils.toWei("37", "gwei");
    const requiredDeposit = config.web3.utils.toWei("60", "kwei");

    const txRequest = await TransactionRequestCore.new();
    await txRequest.initialize(
      [
        accounts[0], // createdBy
        accounts[0], // owner
        accounts[1], // fee recipient
        txRecorder.address, // toAddress
      ],
      [
        0, // fee
        0, // bounty
        claimWindowSize,
        freezePeriod,
        reservedWindowSize,
        2, // temporal unit
        executionWindow,
        windowStart,
        1200000, // callGas
        0, // callValue
        gasPrice,
        requiredDeposit,
      ],
      web3.utils.fromAscii("just-some-call-data")
    );
    expect(txRequest.address).to.exist;

    const requestData = await RequestData.from(txRequest);

    const lastClaimStamp = windowStart.sub(freezePeriod).subn(5);
    const secondsToWait = lastClaimStamp.sub(toBN(timestamp));
    await waitUntilBlock(secondsToWait.toNumber(), 0);

    // Claim it from account[8]
    const claimTx = await txRequest.claim({
      from: accounts[8],
      value: config.web3.utils.toWei("1"),
    });
    expect(claimTx.receipt).to.exist;

    // / Search for the claimed function and expect it to exist.
    const Claimed = claimTx.logs.find((e) => e.event === "Claimed");
    expect(Claimed).to.exist;

    await requestData.refresh();

    expect(requestData.claimData.claimedBy).to.equal(accounts[8]);

    const secs = requestData.schedule.windowStart
      - (await config.web3.eth.getBlock("latest")).timestamp;
    await waitUntilBlock(secs, 0);

    expect(await txRecorder.wasCalled()).to.be.false;

    expect(requestData.meta.wasCalled).to.be.false;

    // / Now let's try to execute it from a third party account
    const failedExecuteTx = await txRequest.execute({
      from: accounts[3],
      gas: 3000000,
      gasPrice,
    });

    expect(await txRecorder.wasCalled()).to.be.false;

    expect(requestData.meta.wasCalled).to.be.false;

    expect(wasAborted(failedExecuteTx)).to.be.true;

    expect(parseAbortData(failedExecuteTx).find((reason) => reason === "ReservedForClaimer")).to.exist;

    // / That shouldn't work, because accounts[8] claimed it...
    // / But this should!
    const executeTx = await txRequest.execute({
      from: accounts[8],
      gas: 3000000,
      gasPrice,
    });
    expect(executeTx.receipt).to.exist;

    // /// Find the logs to prove it.
    const executed = executeTx.logs.find((e) => e.event === "Executed");
    expect(executed).to.exist;

    await requestData.refresh();

    expect(await txRecorder.wasCalled()).to.be.true;

    expect(requestData.meta.wasCalled).to.be.true;
  });
});
