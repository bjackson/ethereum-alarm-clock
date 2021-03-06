pragma solidity 0.6.3;

contract TransactionRecorder {
    address payable owner;

    bool public wasCalled;
    uint public lastCallValue;
    address public lastCaller;
    bytes public lastCallData = "";
    uint public lastCallGas;

    constructor()  public {
        owner = msg.sender;
    }

    fallback() external payable {
        lastCallGas = gasleft();
        lastCallData = msg.data;
        lastCaller = msg.sender;
        lastCallValue = msg.value;
        wasCalled = true;
    }

    receive() external payable {
        lastCallGas = gasleft();
        lastCallData = msg.data;
        lastCaller = msg.sender;
        lastCallValue = msg.value;
        wasCalled = true;
    }

    function __reset__() public {
        lastCallGas = 0;
        lastCallData = "";
        lastCaller = address(0);
        lastCallValue = 0;
        wasCalled = false;
    }

    function kill() public {
        require(msg.sender == owner);
        selfdestruct(owner);
    }
}
