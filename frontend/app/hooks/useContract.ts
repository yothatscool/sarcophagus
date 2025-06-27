import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

export function useContract(contractAddress: string, contractABI: any) {
  const { account } = useWallet();
  const [contract, setContract] = useState<any | null>(null);

  useEffect(() => {
    const initContract = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum && account) {
        try {
          // Dynamically import ethers
          const { ethers } = await import('ethers');
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const signer = await provider.getSigner();
          const ethersContract = new ethers.Contract(contractAddress, contractABI, signer);
          setContract(ethersContract);
        } catch (error) {
          console.error('Error initializing contract:', error);
        }
      }
    };

    initContract();
  }, [account, contractAddress, contractABI]);

  return { contract, account };
} 