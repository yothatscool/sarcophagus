// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IVNSResolver {
    function addr(bytes32 node) external view returns (address);
    function name(bytes32 node) external view returns (string memory);
    function setAddr(bytes32 node, address newAddr) external;
    function setName(bytes32 node, string calldata newName) external;
} 