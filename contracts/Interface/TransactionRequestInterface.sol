pragma solidity 0.5.16;

contract TransactionRequestInterface {

    // Primary actions
    function execute() public returns (bool);
    function cancel() public returns (bool);
    function claim() public payable returns (bool);

    // Proxy function
    function proxy(address payable recipient, bytes memory callData) public payable returns (bool);

    // Data accessors
    function requestData() public view returns (address[6] memory, bool[3] memory, uint[15] memory, uint8[1] memory);
    function callData() public view returns (bytes memory);

    // Pull mechanisms for payments.
    function refundClaimDeposit() public returns (bool);
    function sendFee() public returns (bool);
    function sendBounty() public returns (bool);
    function sendOwnerEther() public returns (bool);
    function sendOwnerEther(address payable recipient) public payable returns (bool);
}
