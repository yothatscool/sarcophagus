// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockVNSResolver {
    mapping(bytes32 => string) private names;
    mapping(bytes32 => address) private addresses;

    function setName(bytes32 node, string calldata name) external {
        names[node] = name;
    }

    function setAddress(bytes32 node, address addr) external {
        addresses[node] = addr;
    }

    function resolveAddress(bytes32 node) external view returns (address) {
        return addresses[node];
    }

    function resolveName(bytes32 node) external view returns (string memory) {
        return names[node];
    }
} 