const fs = require('fs');
const path = require('path');

// Files that are actually used in the simplified protocol
const USED_FILES = [
    'contracts/Sarcophagus.sol',
    'contracts/DeathVerifier.sol',
    'contracts/mocks/MockVTHO.sol',
    'contracts/mocks/MockB3TR.sol',
    'contracts/interfaces/IDeathVerifier.sol',
    'contracts/interfaces/IVIP180.sol',
    'test/Sarcophagus.test.js',
    'scripts/deploy-sarcophagus.js',
    'scripts/deploy-vechain.js',
    'scripts/interact.js'
];

// Files that are unused (from the complex protocol)
const UNUSED_FILES = [
    'contracts/Vereavement.sol',
    'contracts/VereavementBase.sol',
    'contracts/VereavementRitual.sol',
    'contracts/RitualEngine.sol',
    'contracts/TokenManager.sol',
    'contracts/MilestoneManager.sol',
    'contracts/AgeVerification.sol',
    'contracts/VereavementAccess.sol',
    'contracts/RoleManager.sol',
    'contracts/VTHOManager.sol',
    'contracts/libraries/VereavementStorage.sol',
    'contracts/libraries/VereavementConstants.sol',
    'contracts/libraries/VereavementShared.sol',
    'contracts/libraries/VereavementLib.sol',
    'contracts/libraries/VereavementBatchLib.sol',
    'contracts/libraries/VereavementRitualLib.sol',
    'contracts/interfaces/IVereavement.sol',
    'contracts/interfaces/IVereavementRitual.sol',
    'contracts/interfaces/IRitualEngine.sol',
    'contracts/interfaces/ITokenManager.sol',
    'contracts/interfaces/IMilestoneManager.sol',
    'contracts/interfaces/IAgeVerification.sol',
    'contracts/interfaces/IVereavementAccess.sol',
    'contracts/interfaces/IVTHOManager.sol',
    'contracts/interfaces/IVNSResolver.sol',
    'contracts/mocks/MockVIP180.sol',
    'contracts/mocks/MockAttacker.sol',
    'contracts/mocks/MockRitualEngine.sol',
    'contracts/mocks/MockReentrantContract.sol',
    'contracts/mocks/MockVTHOManager.sol',
    'contracts/mocks/MockVNSResolver.sol',
    'contracts/mocks/MockToken.sol',
    'test/VereamentSecurity.test.js',
    'test/VereamentStorage.test.js',
    'test/VereamentGas.test.js',
    'test/VereamentFuzz.test.js',
    'test/VereamentBatch.test.js',
    'scripts/deploy.js'
];

console.log('🔍 Vereavement Protocol - File Cleanup Analysis\n');

console.log('✅ Used Files (Simplified Protocol):');
USED_FILES.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

console.log('\n🗑️  Unused Files (Complex Protocol):');
UNUSED_FILES.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`  ${exists ? '📁' : '❌'} ${file}`);
});

console.log('\n📊 Summary:');
console.log(`  Used files: ${USED_FILES.filter(f => fs.existsSync(f)).length}/${USED_FILES.length}`);
console.log(`  Unused files: ${UNUSED_FILES.filter(f => fs.existsSync(f)).length}/${UNUSED_FILES.length}`);

console.log('\n💡 Recommendations:');
console.log('  1. Keep all used files for the simplified protocol');
console.log('  2. Consider removing unused files to reduce complexity');
console.log('  3. Update README.md to reflect the simplified architecture');
console.log('  4. Clean up test files to focus on Sarcophagus testing');

console.log('\n🚀 To remove unused files, run:');
console.log('  node scripts/cleanup-unused-files.js --remove'); 