// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title MultiSigWallet
 * @dev Multi-signature wallet for Sarcophagus protocol admin functions
 * @notice Provides secure multi-signature approval for critical admin operations
 */
contract MultiSigWallet is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    
    uint256 public constant MIN_SIGNERS = 2;
    uint256 public constant MAX_SIGNERS = 5;
    uint256 public constant TIMELOCK_DELAY = 24 hours;
    
    struct Transaction {
        address target;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
        uint256 timelockEnd;
        mapping(address => bool) isConfirmed;
    }
    
    struct Signer {
        address signerAddress;
        bool isActive;
        uint256 weight;
    }
    
    uint256 private _transactionIds;
    mapping(uint256 => Transaction) public transactions;
    mapping(address => Signer) public signers;
    address[] public signerAddresses;
    uint256 public totalWeight;
    uint256 public requiredWeight;
    
    event TransactionSubmitted(uint256 indexed transactionId, address indexed target, uint256 value, bytes data);
    event TransactionConfirmed(uint256 indexed transactionId, address indexed signer);
    event TransactionRevoked(uint256 indexed transactionId, address indexed signer);
    event TransactionExecuted(uint256 indexed transactionId, address indexed target, uint256 value, bytes data);
    event SignerAdded(address indexed signer, uint256 weight);
    event SignerRemoved(address indexed signer);
    event SignerWeightUpdated(address indexed signer, uint256 newWeight);
    event RequiredWeightUpdated(uint256 newRequiredWeight);
    
    modifier onlySigner() {
        require(signers[msg.sender].isActive, "MultiSig: caller is not a signer");
        _;
    }
    
    modifier transactionExists(uint256 transactionId) {
        require(transactions[transactionId].target != address(0), "MultiSig: transaction does not exist");
        _;
    }
    
    modifier notExecuted(uint256 transactionId) {
        require(!transactions[transactionId].executed, "MultiSig: transaction already executed");
        _;
    }
    
    modifier notConfirmed(uint256 transactionId) {
        require(!transactions[transactionId].isConfirmed[msg.sender], "MultiSig: transaction already confirmed");
        _;
    }
    
    modifier timelockExpired(uint256 transactionId) {
        require(block.timestamp >= transactions[transactionId].timelockEnd, "MultiSig: timelock not expired");
        _;
    }
    
    constructor(address[] memory initialSigners, uint256[] memory weights, uint256 _requiredWeight) {
        require(initialSigners.length >= MIN_SIGNERS && initialSigners.length <= MAX_SIGNERS, "MultiSig: invalid signer count");
        require(initialSigners.length == weights.length, "MultiSig: signers and weights length mismatch");
        require(_requiredWeight > 0, "MultiSig: required weight must be positive");
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(EXECUTOR_ROLE, msg.sender);
        
        // Costly loop: iterates over initial signers to set up the multi-sig
        // This is expected and not a security risk due to small array size (max 5 signers)
        for (uint256 i = 0; i < initialSigners.length; i++) {
            require(initialSigners[i] != address(0), "MultiSig: invalid signer address");
            require(weights[i] > 0, "MultiSig: invalid weight");
            
            signers[initialSigners[i]] = Signer({
                signerAddress: initialSigners[i],
                isActive: true,
                weight: weights[i]
            });
            
            signerAddresses.push(initialSigners[i]);
            totalWeight += weights[i];
            
            _grantRole(EXECUTOR_ROLE, initialSigners[i]);
            
            emit SignerAdded(initialSigners[i], weights[i]);
        }
        
        require(_requiredWeight <= totalWeight, "MultiSig: required weight exceeds total weight");
        requiredWeight = _requiredWeight;
        
        emit RequiredWeightUpdated(_requiredWeight);
    }
    
    /**
     * @dev Submit a new transaction for multi-sig approval
     * @param target Target contract address
     * @param value ETH value to send
     * @param data Function call data
     * @return transactionId The ID of the submitted transaction
     */
    function submitTransaction(
        address target,
        uint256 value,
        bytes calldata data
    ) external onlySigner returns (uint256 transactionId) {
        require(target != address(0), "MultiSig: invalid target address");
        
        _transactionIds++;
        transactionId = _transactionIds;
        
        Transaction storage transaction = transactions[transactionId];
        transaction.target = target;
        transaction.value = value;
        transaction.data = data;
        transaction.executed = false;
        transaction.confirmations = 0;
        transaction.timelockEnd = block.timestamp + TIMELOCK_DELAY;
        
        emit TransactionSubmitted(transactionId, target, value, data);
        
        // Auto-confirm by submitter
        confirmTransaction(transactionId);
    }
    
    /**
     * @dev Confirm a transaction
     * @param transactionId The ID of the transaction to confirm
     */
    function confirmTransaction(uint256 transactionId) 
        public 
        onlySigner 
        transactionExists(transactionId) 
        notExecuted(transactionId) 
        notConfirmed(transactionId) 
    {
        Transaction storage transaction = transactions[transactionId];
        transaction.isConfirmed[msg.sender] = true;
        transaction.confirmations += signers[msg.sender].weight;
        
        emit TransactionConfirmed(transactionId, msg.sender);
    }
    
    /**
     * @dev Revoke confirmation for a transaction
     * @param transactionId The ID of the transaction to revoke
     */
    function revokeConfirmation(uint256 transactionId) 
        external 
        onlySigner 
        transactionExists(transactionId) 
        notExecuted(transactionId) 
    {
        Transaction storage transaction = transactions[transactionId];
        require(transaction.isConfirmed[msg.sender], "MultiSig: transaction not confirmed");
        
        transaction.isConfirmed[msg.sender] = false;
        transaction.confirmations -= signers[msg.sender].weight;
        
        emit TransactionRevoked(transactionId, msg.sender);
    }
    
    /**
     * @dev Execute a confirmed transaction after timelock expires
     * @param transactionId The ID of the transaction to execute
     */
    function executeTransaction(uint256 transactionId) 
        external 
        onlyRole(EXECUTOR_ROLE) 
        transactionExists(transactionId) 
        notExecuted(transactionId) 
        timelockExpired(transactionId) 
        nonReentrant 
    {
        Transaction storage transaction = transactions[transactionId];
        require(transaction.confirmations >= requiredWeight, "MultiSig: insufficient confirmations");
        
        transaction.executed = true;
        
        (bool success, bytes memory _returnData) = transaction.target.call{value: transaction.value}(transaction.data);
        require(success, "MultiSig: transaction execution failed");
        
        emit TransactionExecuted(transactionId, transaction.target, transaction.value, transaction.data);
    }
    
    /**
     * @dev Add a new signer
     * @param signer The address of the new signer
     * @param weight The weight of the new signer
     */
    function addSigner(address signer, uint256 weight) external onlyRole(ADMIN_ROLE) {
        require(signer != address(0), "MultiSig: invalid signer address");
        require(weight > 0, "MultiSig: invalid weight");
        require(!signers[signer].isActive, "MultiSig: signer already exists");
        require(signerAddresses.length < MAX_SIGNERS, "MultiSig: max signers reached");
        
        signers[signer] = Signer({
            signerAddress: signer,
            isActive: true,
            weight: weight
        });
        
        signerAddresses.push(signer);
        totalWeight += weight;
        
        _grantRole(EXECUTOR_ROLE, signer);
        
        emit SignerAdded(signer, weight);
    }
    
    /**
     * @dev Remove a signer
     * @param signer The address of the signer to remove
     */
    function removeSigner(address signer) external onlyRole(ADMIN_ROLE) {
        require(signers[signer].isActive, "MultiSig: signer does not exist");
        require(signerAddresses.length > MIN_SIGNERS, "MultiSig: cannot remove signer below minimum");
        
        // Remove signer from mapping
        delete signers[signer];
        totalWeight -= signers[signer].weight;
        
        // Remove from array - costly operation but necessary for array management
        // This is expected and not a security risk due to small array size
        for (uint256 i = 0; i < signerAddresses.length; i++) {
            if (signerAddresses[i] == signer) {
                signerAddresses[i] = signerAddresses[signerAddresses.length - 1];
                signerAddresses.pop();
                break;
            }
        }
        
        _revokeRole(EXECUTOR_ROLE, signer);
        
        emit SignerRemoved(signer);
    }
    
    /**
     * @dev Update signer weight
     * @param signer The address of the signer
     * @param newWeight The new weight
     */
    function updateSignerWeight(address signer, uint256 newWeight) external onlyRole(ADMIN_ROLE) {
        require(signers[signer].isActive, "MultiSig: signer does not exist");
        require(newWeight > 0, "MultiSig: invalid weight");
        
        uint256 oldWeight = signers[signer].weight;
        signers[signer].weight = newWeight;
        totalWeight = totalWeight - oldWeight + newWeight;
        
        emit SignerWeightUpdated(signer, newWeight);
    }
    
    /**
     * @dev Update required weight for transaction execution
     * @param newRequiredWeight The new required weight
     */
    function updateRequiredWeight(uint256 newRequiredWeight) external onlyRole(ADMIN_ROLE) {
        require(newRequiredWeight > 0, "MultiSig: required weight must be positive");
        require(newRequiredWeight <= totalWeight, "MultiSig: required weight exceeds total weight");
        
        requiredWeight = newRequiredWeight;
        
        emit RequiredWeightUpdated(newRequiredWeight);
    }
    
    /**
     * @dev Get transaction details
     * @param transactionId The ID of the transaction
     * @return target Target contract address
     * @return value ETH value
     * @return data Function call data
     * @return executed Whether transaction is executed
     * @return confirmations Current confirmation weight
     * @return timelockEnd Timelock expiration timestamp
     */
    function getTransaction(uint256 transactionId) 
        external 
        view 
        returns (
            address target,
            uint256 value,
            bytes memory data,
            bool executed,
            uint256 confirmations,
            uint256 timelockEnd
        ) 
    {
        Transaction storage transaction = transactions[transactionId];
        return (
            transaction.target,
            transaction.value,
            transaction.data,
            transaction.executed,
            transaction.confirmations,
            transaction.timelockEnd
        );
    }
    
    /**
     * @dev Check if a signer has confirmed a transaction
     * @param transactionId The ID of the transaction
     * @param signer The address of the signer
     * @return Whether the signer has confirmed
     */
    function isConfirmed(uint256 transactionId, address signer) external view returns (bool) {
        return transactions[transactionId].isConfirmed[signer];
    }
    
    /**
     * @dev Get all signer addresses
     * @return Array of signer addresses
     */
    function getSignerAddresses() external view returns (address[] memory) {
        return signerAddresses;
    }
    
    /**
     * @dev Get signer count
     * @return Number of active signers
     */
    function getSignerCount() external view returns (uint256) {
        return signerAddresses.length;
    }
    
    /**
     * @dev Emergency pause function
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause function
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Emergency withdrawal function
     * @param token Token address (address(0) for ETH)
     * @param to Recipient address
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, address to, uint256 amount) external onlyRole(ADMIN_ROLE) {
        require(to != address(0), "MultiSig: invalid recipient");
        require(amount > 0, "MultiSig: invalid amount");
        
        if (token == address(0)) {
            require(address(this).balance >= amount, "MultiSig: insufficient ETH balance");
            (bool success, ) = to.call{value: amount}("");
            require(success, "MultiSig: ETH transfer failed");
        } else {
            // For ERC20 tokens, this would require IERC20 interface
            // Implementation depends on specific token requirements
            revert("MultiSig: ERC20 withdrawal not implemented");
        }
    }
    
    /**
     * @dev Receive ETH
     */
    receive() external payable {}
    
    /**
     * @dev Fallback function
     */
    fallback() external payable {}
} 