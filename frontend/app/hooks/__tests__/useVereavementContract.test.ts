import { renderHook, act } from '@testing-library/react';
import { useVereavementContract } from '../useVereavementContract';
import { useWallet } from '../../contexts/WalletContext';
import { Contract, BaseContract } from 'ethers';

// Mock the wallet context
jest.mock('../../contexts/WalletContext');

type MockContractMethod = jest.Mock & { mockResolvedValue: (value: any) => void };

interface MockContract extends Partial<BaseContract> {
  getRitualValue: MockContractMethod;
  getCarbonOffset: MockContractMethod;
  getLongevityScore: MockContractMethod;
  getBeneficiaryCount: MockContractMethod;
  getBeneficiaryAtIndex: MockContractMethod;
  interface: {
    encodeFunctionData: jest.Mock;
  };
  address: string;
}

describe('useVereavementContract', () => {
  const mockConnex = {
    thor: {
      account: jest.fn(),
      block: jest.fn(),
      transaction: jest.fn(),
    },
    vendor: {
      sign: jest.fn(),
    },
  };

  const mockContract: MockContract = {
    getRitualValue: jest.fn(),
    getCarbonOffset: jest.fn(),
    getLongevityScore: jest.fn(),
    getBeneficiaryCount: jest.fn(),
    getBeneficiaryAtIndex: jest.fn(),
    interface: {
      encodeFunctionData: jest.fn(),
    },
    address: '0xcontractAddress',
  };

  beforeEach(() => {
    (useWallet as jest.Mock).mockReturnValue({
      connex: mockConnex,
      address: '0xuserAddress',
    });

    // Reset mock implementations
    mockContract.getRitualValue.mockResolvedValue('100');
    mockContract.getCarbonOffset.mockResolvedValue('50');
    mockContract.getLongevityScore.mockResolvedValue('75');
    mockContract.getBeneficiaryCount.mockResolvedValue({ toNumber: () => 2 });
    mockContract.getBeneficiaryAtIndex.mockImplementation((_: unknown, index: number) => 
      Promise.resolve({
        beneficiaryAddress: `0xbeneficiary${index}`,
        percentage: { toNumber: () => 30 + (index * 20) },
      })
    );
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useVereavementContract());
    
    expect(result.current.ritualValue).toBe('0');
    expect(result.current.carbonOffset).toBe('0');
    expect(result.current.longevityScore).toBe('0');
  });

  it('fetches contract data on mount', async () => {
    const { result } = renderHook(() => useVereavementContract());
    
    await act(async () => {
      await result.current.refreshData();
    });

    expect(result.current.ritualValue).toBe('100');
    expect(result.current.carbonOffset).toBe('50');
    expect(result.current.longevityScore).toBe('75');
  });

  it('fetches beneficiaries correctly', async () => {
    const { result } = renderHook(() => useVereavementContract());
    
    const beneficiaries = await act(async () => {
      return await result.current.getBeneficiaries();
    });

    expect(beneficiaries).toEqual([
      { address: '0xbeneficiary0', percentage: 30 },
      { address: '0xbeneficiary1', percentage: 50 },
    ]);
  });

  it('handles transaction signing for contract interactions', async () => {
    const mockTxResponse = {
      txid: '0xtxid',
      wait: jest.fn().mockResolvedValue({}),
    };

    mockConnex.vendor.sign.mockResolvedValue(mockTxResponse);
    mockContract.interface.encodeFunctionData.mockReturnValue('0xencoded');

    const { result } = renderHook(() => useVereavementContract());
    
    await act(async () => {
      const tx = await result.current.createRitualVault();
      await tx.wait();
    });

    expect(mockConnex.vendor.sign).toHaveBeenCalledWith('tx', [
      { to: mockContract.address, value: '0x0', data: '0xencoded' },
    ]);
  });

  it('handles transaction failures', async () => {
    mockConnex.vendor.sign.mockRejectedValue(new Error('Transaction failed'));

    const { result } = renderHook(() => useVereavementContract());
    
    await expect(
      act(async () => {
        await result.current.createRitualVault();
      })
    ).rejects.toThrow('Transaction failed');
  });

  it('updates state after successful transactions', async () => {
    const mockTxResponse = {
      txid: '0xtxid',
      wait: jest.fn().mockResolvedValue({}),
    };

    mockConnex.vendor.sign.mockResolvedValue(mockTxResponse);
    
    const { result } = renderHook(() => useVereavementContract());
    
    await act(async () => {
      const tx = await result.current.addBeneficiary('0xnewbeneficiary', 20);
      await tx.wait();
    });

    expect(mockContract.interface.encodeFunctionData).toHaveBeenCalledWith(
      'addBeneficiary',
      ['0xnewbeneficiary', 20]
    );
  });

  it('handles contract initialization failure', () => {
    (useWallet as jest.Mock).mockReturnValue({
      connex: null,
      address: null,
    });

    const { result } = renderHook(() => useVereavementContract());
    
    expect(result.current.contract).toBeNull();
  });
}); 