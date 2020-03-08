pragma solidity 0.6.3;

/**
 * @title RequestMetaLib
 * @dev Small library holding all the metadata about a TransactionRequest.
 */
library RequestMetaLib {

    struct RequestMeta {
        address payable owner;              /// The address that created this request.

        address createdBy;          /// The address of the RequestFactory which created this request.

        bool isCancelled;           /// Was the TransactionRequest cancelled?

        bool wasCalled;             /// Was the TransactionRequest called?

        bool wasSuccessful;         /// Was the return value from the TransactionRequest execution successful?
    }

}
