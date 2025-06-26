# 🔒 Security Analysis Setup Guide

## Overview
This guide provides comprehensive setup instructions for security analysis tools to audit the Sarcophagus protocol smart contracts.

## 🛠️ Required Tools

### 1. **Slither (Static Analysis)**
Slither is a Solidity static analysis framework written in Python.

#### Installation:
```bash
# Install Python 3.8+ first from https://python.org
pip install slither-analyzer

# Or using pip3
pip3 install slither-analyzer
```

#### Usage:
```bash
# Basic analysis
slither contracts/

# Detailed analysis with all detectors
slither contracts/ --detect all

# Generate report
slither contracts/ --json slither-report.json

# Check specific contracts
slither contracts/Sarcophagus.sol contracts/OBOL.sol
```

### 2. **Echidna (Fuzzing)**
Echidna is a smart contract fuzzer for finding vulnerabilities.

#### Installation:
```bash
# Using Docker (recommended)
docker pull crytic/echidna

# Or build from source
git clone https://github.com/crytic/echidna.git
cd echidna
cargo build --release
```

#### Usage:
```bash
# Basic fuzzing
echidna-test contracts/Sarcophagus.sol --contract Sarcophagus

# With custom config
echidna-test contracts/Sarcophagus.sol --config echidna.config.yml

# Generate test cases
echidna-testgen contracts/Sarcophagus.sol --contract Sarcophagus
```

### 3. **Mythril (Symbolic Analysis)**
Mythril is a security analysis tool for Ethereum smart contracts.

#### Installation:
```bash
pip install mythril
```

#### Usage:
```bash
# Analyze contract
myth analyze contracts/Sarcophagus.sol

# With specific settings
myth analyze contracts/Sarcophagus.sol --execution-timeout 300
```

## 📋 Security Analysis Scripts

### Automated Analysis Script
Create `scripts/security-analysis.js`:

```javascript
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔒 Starting Security Analysis...\n');

// 1. Run Slither
try {
    console.log('📊 Running Slither static analysis...');
    execSync('slither contracts/ --detect all --json slither-report.json', { stdio: 'inherit' });
    console.log('✅ Slither analysis completed\n');
} catch (error) {
    console.log('❌ Slither analysis failed:', error.message);
}

// 2. Run Mythril
try {
    console.log('🔍 Running Mythril symbolic analysis...');
    execSync('myth analyze contracts/Sarcophagus.sol --execution-timeout 300', { stdio: 'inherit' });
    console.log('✅ Mythril analysis completed\n');
} catch (error) {
    console.log('❌ Mythril analysis failed:', error.message);
}

// 3. Run Echidna
try {
    console.log('🦔 Running Echidna fuzzing...');
    execSync('echidna-test contracts/Sarcophagus.sol --contract Sarcophagus --test-limit 50000', { stdio: 'inherit' });
    console.log('✅ Echidna fuzzing completed\n');
} catch (error) {
    console.log('❌ Echidna fuzzing failed:', error.message);
}

console.log('🎉 Security analysis completed!');
```

### Echidna Configuration
Create `echidna.config.yml`:

```yaml
testMode: assertion
testLimit: 50000
corpusDir: corpus
coverage: true
format: text
contract: Sarcophagus
deployer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
sender: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"]
```

## 🧪 Custom Security Tests

### Property-Based Tests
Create `test/echidna-properties.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../contracts/Sarcophagus.sol";
import "../contracts/OBOL.sol";

contract SarcophagusEchidnaTest {
    Sarcophagus public sarcophagus;
    OBOL public obol;
    
    constructor() {
        // Setup contracts
    }
    
    // Property: Total inheritance never exceeds deposits
    function echidna_inheritance_never_exceeds_deposits() public view returns (bool) {
        // Implementation
        return true;
    }
    
    // Property: No double spending
    function echidna_no_double_spending() public view returns (bool) {
        // Implementation
        return true;
    }
    
    // Property: Access control maintained
    function echidna_access_control_maintained() public view returns (bool) {
        // Implementation
        return true;
    }
}
```

## 📊 Analysis Reports

### Slither Report Structure
```json
{
  "success": true,
  "error": null,
  "results": {
    "detectors": [
      {
        "check": "reentrancy-eth",
        "impact": "High",
        "confidence": "Medium",
        "description": "Reentrancy vulnerabilities",
        "elements": []
      }
    ]
  }
}
```

### Echidna Report Structure
```
Echidna found 1 test failure:
  test_name: echidna_inheritance_never_exceeds_deposits
  status: FAILED
  error: assertion failed
  sequence: [call1, call2, ...]
```

## 🔧 Integration with CI/CD

### GitHub Actions Workflow
Create `.github/workflows/security-analysis.yml`:

```yaml
name: Security Analysis

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.9'
    
    - name: Install Slither
      run: pip install slither-analyzer
    
    - name: Install Mythril
      run: pip install mythril
    
    - name: Run Slither
      run: slither contracts/ --detect all --json slither-report.json
    
    - name: Run Mythril
      run: myth analyze contracts/Sarcophagus.sol
    
    - name: Upload Reports
      uses: actions/upload-artifact@v2
      with:
        name: security-reports
        path: slither-report.json
```

## 🎯 Focus Areas for Analysis

### 1. **Access Control**
- Role-based permissions
- Privilege escalation
- Unauthorized access

### 2. **Reentrancy**
- Cross-function reentrancy
- Cross-contract reentrancy
- Read-only reentrancy

### 3. **Arithmetic Issues**
- Integer overflow/underflow
- Precision loss
- Division by zero

### 4. **Logic Flaws**
- Business logic vulnerabilities
- State inconsistencies
- Race conditions

### 5. **Gas Optimization**
- Gas limit issues
- Infinite loops
- Storage optimization

## 📈 Continuous Monitoring

### Automated Alerts
Set up alerts for:
- New vulnerabilities detected
- Failed security tests
- Unusual contract behavior

### Regular Audits
- Weekly automated scans
- Monthly manual reviews
- Quarterly comprehensive audits

## 🚀 Quick Start Commands

```bash
# Install all tools
pip install slither-analyzer mythril
docker pull crytic/echidna

# Run complete analysis
npm run security:analyze

# Run specific tools
npm run security:slither
npm run security:mythril
npm run security:echidna

# Generate reports
npm run security:report
```

## 📞 Support

For issues with security tools:
- Slither: https://github.com/crytic/slither
- Echidna: https://github.com/crytic/echidna
- Mythril: https://github.com/ConsenSys/mythril

## 🔍 Additional Resources

- [Consensys Diligence](https://consensys.net/diligence/)
- [OpenZeppelin Security](https://security.openzeppelin.org/)
- [Trail of Bits](https://www.trailofbits.com/)
- [Certik](https://www.certik.com/) 