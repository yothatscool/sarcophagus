const fs = require('fs');
const path = require('path');

async function updateFrontendConfig() {
  console.log("Updating frontend configuration with deployed contract addresses...");

  try {
    // Read deployment info
    const deploymentPath = path.join(__dirname, '..', 'deployment-testnet.json');
    if (!fs.existsSync(deploymentPath)) {
      console.error("Deployment file not found. Please run deployment first.");
      return;
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    
    // Frontend config paths
    const frontendConfigPath = path.join(__dirname, '..', 'frontend', 'app', 'config', 'contracts.ts');
    const frontendEnvPath = path.join(__dirname, '..', 'frontend', '.env.local');

    // Update contracts.ts
    const contractsConfig = `// Auto-generated from deployment
export const CONTRACT_ADDRESSES = {
  SARCOPHAGUS: "${deploymentInfo.contracts.Sarcophagus}",
  DEATH_VERIFIER: "${deploymentInfo.contracts.DeathVerifier}",
  OBOL_TOKEN: "${deploymentInfo.contracts.OBOL}",
  B3TR_REWARDS: "${deploymentInfo.contracts.B3TRRewards}",
  MULTISIG_WALLET: "${deploymentInfo.contracts.MultiSigWallet}",
} as const;

export const ORACLE_ADDRESSES = [
  "${deploymentInfo.oracles.join('",\n  "')}"
] as const;

export const MULTISIG_CONFIG = {
  signers: [
    "${deploymentInfo.multisig.signers.join('",\n    "')}"
  ],
  weights: [${deploymentInfo.multisig.weights.join(', ')}],
  requiredWeight: ${deploymentInfo.multisig.requiredWeight}
} as const;

export const NETWORK_CONFIG = {
  name: "${deploymentInfo.network}",
  chainId: 1, // VeChain mainnet, use 0 for testnet
  rpcUrl: "https://mainnet.veblocks.net",
  explorerUrl: "https://explore.vechain.org"
} as const;
`;

    // Write contracts config
    fs.writeFileSync(frontendConfigPath, contractsConfig);
    console.log("✅ Updated frontend/config/contracts.ts");

    // Update .env.local
    const envConfig = `# Auto-generated from deployment
NEXT_PUBLIC_SARCOPHAGUS_ADDRESS=${deploymentInfo.contracts.Sarcophagus}
NEXT_PUBLIC_DEATH_VERIFIER_ADDRESS=${deploymentInfo.contracts.DeathVerifier}
NEXT_PUBLIC_OBOL_TOKEN_ADDRESS=${deploymentInfo.contracts.OBOL}
NEXT_PUBLIC_B3TR_REWARDS_ADDRESS=${deploymentInfo.contracts.B3TRRewards}
NEXT_PUBLIC_MULTISIG_WALLET_ADDRESS=${deploymentInfo.contracts.MultiSigWallet}
NEXT_PUBLIC_NETWORK_NAME=${deploymentInfo.network}
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_RPC_URL=https://mainnet.veblocks.net
NEXT_PUBLIC_EXPLORER_URL=https://explore.vechain.org
`;

    fs.writeFileSync(frontendEnvPath, envConfig);
    console.log("✅ Updated frontend/.env.local");

    // Create deployment summary
    const summary = `
# Deployment Summary - ${deploymentInfo.network}

## Contract Addresses
- **Sarcophagus**: ${deploymentInfo.contracts.Sarcophagus}
- **DeathVerifier**: ${deploymentInfo.contracts.DeathVerifier}
- **OBOL Token**: ${deploymentInfo.contracts.OBOL}
- **B3TR Rewards**: ${deploymentInfo.contracts.B3TRRewards}
- **MultiSig Wallet**: ${deploymentInfo.contracts.MultiSigWallet}

## Oracle Addresses
${deploymentInfo.oracles.map((addr, i) => `- Oracle ${i + 1}: ${addr}`).join('\n')}

## MultiSig Configuration
- **Signers**: ${deploymentInfo.multisig.signers.length}
- **Required Weight**: ${deploymentInfo.multisig.requiredWeight}%
- **Weights**: ${deploymentInfo.multisig.weights.join('%, ')}%

## Deployment Info
- **Network**: ${deploymentInfo.network}
- **Deployer**: ${deploymentInfo.deployer}
- **Timestamp**: ${deploymentInfo.timestamp}

## Next Steps
1. Verify contracts on VeChain explorer
2. Test all functions on testnet
3. Update B3TR token address if needed
4. Test oracle death verification
5. Deploy frontend to Vercel
`;

    const summaryPath = path.join(__dirname, '..', 'DEPLOYMENT_SUMMARY.md');
    fs.writeFileSync(summaryPath, summary);
    console.log("✅ Created DEPLOYMENT_SUMMARY.md");

    console.log("\n=== FRONTEND CONFIGURATION UPDATED ===");
    console.log("Frontend is now configured with deployed contract addresses");
    console.log("You can now run the frontend with: cd frontend && npm run dev");

  } catch (error) {
    console.error("Failed to update frontend configuration:", error);
    throw error;
  }
}

updateFrontendConfig()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 