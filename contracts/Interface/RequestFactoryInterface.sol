pragma solidity 0.5.16;

contract RequestFactoryInterface {
    event RequestCreated(address request, address indexed owner, int indexed bucket, uint[12] params);

    function createRequest(address payable[3] memory addressArgs, uint[12] memory uintArgs, bytes memory allData) public payable returns (address);
    function createValidatedRequest(address payable[3] memory addressArgs, uint[12] memory uintArgs, bytes memory callData)
        public payable returns (address);
    function validateRequestParams(address payable[3] memory addressArgs, uint[12] memory uintArgs, uint endowment) public view returns (bool[6] memory);
    function isKnownRequest(address _address) public view returns (bool);
}
