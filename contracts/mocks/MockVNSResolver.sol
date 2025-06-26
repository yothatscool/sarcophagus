// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IVNSResolver {
    function addr(bytes32 node) external view returns (address);
    function name(bytes32 node) external view returns (string memory);
}

contract MockVNSResolver is IVNSResolver {
    mapping(bytes32 => address) private addresses;
    mapping(bytes32 => string) private names;

    function addr(bytes32 node) external view override returns (address) {
        return addresses[node];
    }

    function name(bytes32 node) external view override returns (string memory) {
        return names[node];
    }

    function setAddr(bytes32 node, address addrToSet) external {
        addresses[node] = addrToSet;
    }

    function setNodeName(bytes32 node, string calldata nameToSet) external {
        names[node] = nameToSet;
    }
} 