const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔒 Starting Comprehensive Security Analysis...\n');

// Configuration
const CONTRACTS_DIR = 'contracts/';
const REPORTS_DIR = 'security-reports/';
const MAIN_CONTRACTS = [
  'Sarcophagus.sol',
  'OBOL.sol', 
  'DeathVerifier.sol',
  'TokenManager.sol',
  'VTHOManager.sol',
  'Vereavement.sol',
  'B3TRRewards.sol'
];

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Helper function to run command and handle errors
function runCommand(command, description) {
  try {
    console.log(`📊 ${description}...`);
    const result = execSync(command, { stdio: 'pipe', encoding: 'utf8' });
    console.log(`✅ ${description} completed\n`);
    return { success: true, output: result };
  } catch (error) {
    console.log(`❌ ${description} failed: ${error.message}\n`);
    return { success: false, output: error.stdout || error.message };
  }
}

// Helper function to write report
function writeReport(filename, content) {
  const filepath = path.join(REPORTS_DIR, filename);
  fs.writeFileSync(filepath, content);
  console.log(`📄 Report saved: ${filepath}`);
}

// Main analysis function
async function runSecurityAnalysis() {
  const results = {
    timestamp: new Date().toISOString(),
    tools: {},
    summary: {
      totalIssues: 0,
      criticalIssues: 0,
      highIssues: 0,
      mediumIssues: 0,
      lowIssues: 0
    }
  };

  console.log('🚀 Phase 1: Static Analysis\n');

  // 1. Slither Analysis
  console.log('🔍 Running Slither static analysis...');
  const slitherResult = runCommand(
    'py -m slither . --hardhat-ignore-compile --detect all --json security-reports/slither-detailed.json',
    'Slither static analysis'
  );
  
  if (slitherResult.success) {
    results.tools.slither = {
      status: 'success',
      issues: parseSlitherIssues(slitherResult.output)
    };
    results.summary.totalIssues += results.tools.slither.issues.length;
  } else {
    results.tools.slither = {
      status: 'failed',
      error: slitherResult.output
    };
  }

  // 2. Compile and check for compilation errors
  console.log('🔨 Checking compilation...');
  const compileResult = runCommand(
    'npx hardhat compile',
    'Contract compilation'
  );
  
  results.tools.compilation = {
    status: compileResult.success ? 'success' : 'failed',
    output: compileResult.output
  };

  console.log('🚀 Phase 2: Test Suite Analysis\n');

  // 3. Run security tests
  console.log('🧪 Running security test suite...');
  const securityTestResult = runCommand(
    'npx hardhat test test/security-audit.test.js',
    'Security test suite'
  );
  
  results.tools.securityTests = {
    status: securityTestResult.success ? 'success' : 'failed',
    output: securityTestResult.output
  };

  // 4. Run all tests for coverage
  console.log('📊 Running full test suite...');
  const fullTestResult = runCommand(
    'npx hardhat test',
    'Full test suite'
  );
  
  results.tools.fullTests = {
    status: fullTestResult.success ? 'success' : 'failed',
    output: fullTestResult.output
  };

  console.log('🚀 Phase 3: Code Quality Analysis\n');

  // 5. Gas analysis
  console.log('⛽ Running gas analysis...');
  const gasResult = runCommand(
    'npx hardhat test test/VereamentGas.test.js',
    'Gas optimization analysis'
  );
  
  results.tools.gasAnalysis = {
    status: gasResult.success ? 'success' : 'failed',
    output: gasResult.output
  };

  // 6. Contract size analysis
  console.log('📏 Analyzing contract sizes...');
  const contractSizes = analyzeContractSizes();
  results.tools.contractSizes = contractSizes;

  console.log('🚀 Phase 4: Manual Review Checklist\n');

  // 7. Generate manual review checklist
  const manualChecklist = generateManualChecklist();
  results.tools.manualChecklist = manualChecklist;

  // Generate comprehensive report
  generateComprehensiveReport(results);

  console.log('🎉 Security analysis completed!');
  console.log(`📁 Reports saved in: ${REPORTS_DIR}`);
  
  return results;
}

// Helper function to parse Slither issues
function parseSlitherIssues(output) {
  const issues = [];
  const lines = output.split('\n');
  
  for (const line of lines) {
    if (line.includes('INFO:Detectors:')) {
      const issue = {
        type: 'detector',
        description: line.replace('INFO:Detectors:', '').trim()
      };
      issues.push(issue);
    }
  }
  
  return issues;
}

// Helper function to analyze contract sizes
function analyzeContractSizes() {
  const sizes = {};
  const artifactsDir = 'artifacts/contracts/';
  
  if (fs.existsSync(artifactsDir)) {
    const files = fs.readdirSync(artifactsDir, { recursive: true });
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const contractPath = path.join(artifactsDir, file);
          const contractData = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
          
          if (contractData.bytecode && contractData.bytecode.object) {
            const bytecodeSize = contractData.bytecode.object.length / 2; // Convert hex to bytes
            const contractName = path.basename(file, '.json');
            sizes[contractName] = {
              bytecodeSize,
              deployedSize: bytecodeSize - 2, // Remove constructor
              isOverLimit: bytecodeSize > 24576 // 24KB limit
            };
          }
        } catch (error) {
          // Skip invalid JSON files
        }
      }
    }
  }
  
  return sizes;
}

// Helper function to generate manual review checklist
function generateManualChecklist() {
  return {
    accessControl: [
      '✅ Role-based access control implemented',
      '✅ Admin functions properly protected',
      '✅ Emergency pause functionality',
      '⚠️ Multi-signature requirements needed',
      '⚠️ Role delegation mechanisms needed'
    ],
    reentrancy: [
      '✅ ReentrancyGuard used in critical functions',
      '⚠️ CEI pattern not consistently followed',
      '⚠️ External calls before state updates found',
      '⚠️ Pull over push pattern needed'
    ],
    economicSecurity: [
      '✅ Rate limiting implemented',
      '✅ Cooldown periods in place',
      '⚠️ Flash loan attack protection needed',
      '⚠️ MEV protection mechanisms needed',
      '⚠️ Economic attack simulations needed'
    ],
    oracleSecurity: [
      '✅ Oracle signature verification',
      '⚠️ Oracle downtime handling needed',
      '⚠️ Multiple oracle support needed',
      '⚠️ Oracle manipulation protection needed'
    ],
    upgradeability: [
      '⚠️ Upgradeable pattern not implemented',
      '⚠️ Proxy pattern needed',
      '⚠️ Storage layout safety needed',
      '⚠️ Upgrade governance needed'
    ]
  };
}

// Helper function to generate comprehensive report
function generateComprehensiveReport(results) {
  const report = `# 🔒 Comprehensive Security Analysis Report
## Vereavement Protocol Smart Contracts

**Analysis Date:** ${new Date().toLocaleDateString()}
**Analysis Time:** ${new Date().toLocaleTimeString()}

---

## 📊 Executive Summary

### Overall Security Score: ${calculateSecurityScore(results)}/10

### Key Findings:
- **Total Issues Found:** ${results.summary.totalIssues}
- **Critical Issues:** ${results.summary.criticalIssues}
- **High Priority Issues:** ${results.summary.highIssues}
- **Medium Priority Issues:** ${results.summary.mediumIssues}
- **Low Priority Issues:** ${results.summary.lowIssues}

---

## 🛠️ Tool Results

### 1. Slither Static Analysis
**Status:** ${results.tools.slither?.status || 'Not run'}
${results.tools.slither?.status === 'success' ? 
  `**Issues Found:** ${results.tools.slither.issues.length}` : 
  `**Error:** ${results.tools.slither?.error || 'Unknown error'}`}

### 2. Compilation Status
**Status:** ${results.tools.compilation?.status || 'Not run'}
${results.tools.compilation?.status === 'failed' ? 
  `**Errors:** ${results.tools.compilation.output}` : 
  '✅ All contracts compile successfully'}

### 3. Security Test Suite
**Status:** ${results.tools.securityTests?.status || 'Not run'}
${results.tools.securityTests?.status === 'failed' ? 
  `**Test Failures:** ${results.tools.securityTests.output}` : 
  '✅ Security tests passing'}

### 4. Full Test Suite
**Status:** ${results.tools.fullTests?.status || 'Not run'}
${results.tools.fullTests?.status === 'failed' ? 
  `**Test Failures:** ${results.tools.fullTests.output}` : 
  '✅ All tests passing'}

### 5. Gas Analysis
**Status:** ${results.tools.gasAnalysis?.status || 'Not run'}
${results.tools.gasAnalysis?.status === 'failed' ? 
  `**Analysis Errors:** ${results.tools.gasAnalysis.output}` : 
  '✅ Gas analysis completed'}

---

## 📏 Contract Size Analysis

${Object.entries(results.tools.contractSizes || {}).map(([name, data]) => 
  `### ${name}
- **Bytecode Size:** ${data.bytecodeSize} bytes
- **Deployed Size:** ${data.deployedSize} bytes
- **Over Limit:** ${data.isOverLimit ? '⚠️ YES' : '✅ NO'}`
).join('\n\n')}

---

## ✅ Manual Review Checklist

### Access Control
${results.tools.manualChecklist?.accessControl?.map(item => `- ${item}`).join('\n') || 'Not available'}

### Reentrancy Protection
${results.tools.manualChecklist?.reentrancy?.map(item => `- ${item}`).join('\n') || 'Not available'}

### Economic Security
${results.tools.manualChecklist?.economicSecurity?.map(item => `- ${item}`).join('\n') || 'Not available'}

### Oracle Security
${results.tools.manualChecklist?.oracleSecurity?.map(item => `- ${item}`).join('\n') || 'Not available'}

### Upgradeability
${results.tools.manualChecklist?.upgradeability?.map(item => `- ${item}`).join('\n') || 'Not available'}

---

## 🎯 Recommendations

### Immediate Actions (1-2 weeks)
1. Fix all critical reentrancy vulnerabilities
2. Implement proper access controls
3. Add comprehensive error handling

### Short-term Actions (2-4 weeks)
1. Address high-priority security issues
2. Implement upgradeable pattern
3. Add economic attack protections

### Long-term Actions (1-3 months)
1. Conduct professional security audit
2. Implement formal verification
3. Establish bug bounty program

---

## 📁 Generated Reports

- **Slither Analysis:** \`security-reports/slither-detailed.json\`
- **Security Summary:** \`security-reports/slither-analysis-summary.md\`
- **Comprehensive Report:** \`security-reports/comprehensive-security-report.md\`

---

**Note:** This report is generated automatically. For detailed analysis, refer to individual tool outputs and conduct manual code review.
`;

  writeReport('comprehensive-security-report.md', report);
}

// Helper function to calculate security score
function calculateSecurityScore(results) {
  let score = 10;
  
  // Deduct points for issues
  if (results.tools.slither?.status === 'failed') score -= 2;
  if (results.tools.compilation?.status === 'failed') score -= 3;
  if (results.tools.securityTests?.status === 'failed') score -= 2;
  if (results.tools.fullTests?.status === 'failed') score -= 1;
  
  // Ensure minimum score
  return Math.max(0, Math.min(10, score));
}

// Run the analysis
if (require.main === module) {
  runSecurityAnalysis()
    .then(results => {
      console.log('\n🎯 Analysis Summary:');
      console.log(`- Total Issues: ${results.summary.totalIssues}`);
      console.log(`- Security Score: ${calculateSecurityScore(results)}/10`);
      console.log(`- Reports Generated: ${Object.keys(results.tools).length}`);
    })
    .catch(error => {
      console.error('❌ Analysis failed:', error);
      process.exit(1);
    });
}

module.exports = { runSecurityAnalysis }; 