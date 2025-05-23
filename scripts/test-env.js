require('dotenv').config();

console.log('Testing .env configuration:');
console.log('VECHAIN_URL exists:', !!process.env.VECHAIN_URL);
console.log('MNEMONIC exists:', !!process.env.MNEMONIC);
console.log('File path:', require('path').resolve('.env')); 