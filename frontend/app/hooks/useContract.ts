import { useState, useEffect } from 'react';
import { ethers, BrowserProvider, JsonRpcSigner, Contract } from 'ethers';

export function useContract(contractAddress: string, contractABI: any) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);

  useEffect(() => {
    const initContract = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const provider = new BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new Contract(contractAddress, contractABI, signer);
          
          setProvider(provider);
          setSigner(signer);
          setContract(contract);
        } catch (error) {
          console.error('Error initializing contract:', error);
        }
      }
    };

    initContract();
  }, [contractAddress, contractABI]);

  return { contract, provider, signer };
} 