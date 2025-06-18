import { Contract, ethers } from 'ethers';
import { Framework } from '@vechain/connex-framework';
import { CONTRACT_ADDRESSES } from '../config/contracts';

export interface TransactionResponse {
  hash: string;
  wait: () => Promise<any>;
}

export async function getContract(
  connex: Framework | null,
  address: string,
  abi: any[]
): Promise<Contract | null> {
  if (!connex) return null;

  try {
    const provider = new ethers.JsonRpcProvider('https://testnet.veblocks.net');
    return new ethers.Contract(address, abi, provider);
  } catch (error) {
    console.error('Error initializing contract:', error);
    return null;
  }
}

export async function sendTransaction(
  connex: Framework | null,
  contract: Contract | null,
  method: string,
  args: any[] = []
): Promise<TransactionResponse> {
  if (!connex || !contract) {
    throw new Error('Contract or connection not initialized');
  }

  try {
    const clause = contract.interface.encodeFunctionData(method, args);
    const tx = await connex.vendor
      .sign('tx', [{ to: contract.address, value: '0x0', data: clause }])
      .request();

    return {
      hash: tx.txid,
      wait: async () => {
        const receipt = await connex.thor.transaction(tx.txid).getReceipt();
        if (receipt?.reverted) {
          throw new Error('Transaction reverted');
        }
        return receipt;
      },
    };
  } catch (error) {
    console.error(`Error sending transaction to ${method}:`, error);
    throw error;
  }
} 