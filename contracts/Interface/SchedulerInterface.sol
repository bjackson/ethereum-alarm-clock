pragma solidity 0.6.3;

/**
 * @title SchedulerInterface
 * @dev The base contract that the higher contracts: BaseScheduler, BlockScheduler and TimestampScheduler all inherit from.
 */
abstract contract SchedulerInterface {
    function schedule(address payable _toAddress, bytes memory _callData, uint[8] memory _uintArgs)
        public virtual payable returns (address);
    function computeEndowment(uint _bounty, uint _fee, uint _callGas, uint _callValue, uint _gasPrice)
        public virtual view returns (uint);
}
