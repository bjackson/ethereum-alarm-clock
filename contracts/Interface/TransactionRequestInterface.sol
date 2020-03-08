pragma solidity 0.6.3;

abstract contract TransactionRequestInterface {

    // Primary actions
    function execute() public virtual returns (bool);
    function cancel() public virtual returns (bool);
    function claim() public virtual payable returns (bool);

    // Proxy function
    function proxy(address payable recipient, bytes memory callData) public virtual payable returns (bool);

    // Data accessors
    function requestData() public virtual view returns (address[6] memory, bool[3] memory, uint[15] memory, uint8[1] memory);
    function callData() public virtual view returns (bytes memory);

    // Pull mechanisms for payments.
    function refundClaimDeposit() public virtual returns (bool);
    function sendFee() public virtual returns (bool);
    function sendBounty() public virtual returns (bool);
    function sendOwnerEther() public virtual returns (bool);
    function sendOwnerEther(address payable recipient) public virtual payable returns (bool);
}
