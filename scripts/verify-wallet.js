require('dotenv').config();
const { mnemonic: Mnemonic, HDNode } = require('thor-devkit');

async function main() {
    try {
        // Get wallet configuration
        const mnemonic = process.env.MNEMONIC;
        const privateKey = process.env.PRIVATE_KEY;
        
        if (!mnemonic && !privateKey) {
            throw new Error("No wallet credentials found. Please set MNEMONIC or PRIVATE_KEY in .env file");
        }

        console.log("\nWallet Configuration");
        console.log("===================");

        let wallet;
        if (mnemonic) {
            console.log("Using mnemonic-based wallet");
            
            // Clean and validate mnemonic
            const cleanMnemonic = mnemonic.replace(/"/g, '').trim();
            const words = cleanMnemonic.split(' ').filter(word => word.length > 0);
            
            if (!Mnemonic.validate(words)) {
                throw new Error("Invalid mnemonic phrase");
            }
            
            // Create master node and derive using Sync2's path
            const hdNode = HDNode.fromMnemonic(words);
            const derivedNode = hdNode.derive(0);
            
            wallet = {
                address: derivedNode.address,
                privateKey: derivedNode.privateKey
            };
            
            console.log("\nDerivation Path");
            console.log("===============");
            console.log("Using Sync2 path: m/0'");
            
        } else {
            console.log("Using private key-based wallet");
            if (!privateKey.match(/^[0-9a-fA-F]{64}$/)) {
                throw new Error("Invalid private key format");
            }
            const node = HDNode.fromPrivateKey(Buffer.from(privateKey, 'hex'));
            wallet = {
                address: node.address,
                privateKey: node.privateKey
            };
        }

        console.log("\nWallet Details");
        console.log("==============");
        console.log("Address:", wallet.address);
        console.log("\n✅ Wallet configuration is valid and working!");
        
    } catch (error) {
        console.error("\n❌ Error verifying wallet configuration:");
        console.error(error.message || error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 