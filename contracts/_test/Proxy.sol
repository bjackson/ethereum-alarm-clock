pragma solidity 0.5.16;

import "contracts/Interface/SchedulerInterface.sol";
import "contracts/Interface/TransactionRequestInterface.sol";

contract Proxy {
    SchedulerInterface public scheduler;
    address payable public receipient;
    address public scheduledTransaction;
    address public owner;

    constructor(address _scheduler, address payable _receipient, uint _payout, uint _gasPrice, uint _delay) public payable {
        scheduler = SchedulerInterface(_scheduler);
        receipient = _receipient;
        owner = msg.sender;

        scheduledTransaction = scheduler.schedule.value(msg.value)(
            address(this),              // toAddress
            "",                     // callData
            [
                2000000,            // The amount of gas to be sent with the transaction.
                _payout,                  // The amount of wei to be sent.
                255,                // The size of the execution window.
                block.number + _delay,        // The start of the execution window.
                _gasPrice,    // The gasprice for the transaction
                12345 wei,          // The fee included in the transaction.
                224455 wei,         // The bounty that awards the executor of the transaction.
                20000 wei           // The required amount of wei the claimer must send as deposit.
            ]
        );
    }

    function () external payable {
        if (msg.value > 0) {
            receipient.transfer(msg.value);
        }
    }

    function sendOwnerEther(address payable _receipient) public payable {
        if (msg.sender == owner && _receipient != address(0)) {
            TransactionRequestInterface(scheduledTransaction).sendOwnerEther(_receipient);
        }
    }
}
