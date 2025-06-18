import { renderHook, act } from '@testing-library/react';
import { useMemorialContract } from '../useMemorialContract';
import { useWallet } from '../../contexts/WalletContext';
import { Contract } from 'ethers';

jest.mock('../../contexts/WalletContext');

interface MockContract extends Partial<Contract> {
  preserveMemorial: jest.Mock;
  getMemorialCount: jest.Mock;
  getMemorialAtIndex: jest.Mock;
  interface: {
    encodeFunctionData: jest.Mock;
  };
  address: string;
}

describe('useMemorialContract', () => {
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
    preserveMemorial: jest.fn(),
    getMemorialCount: jest.fn(),
    getMemorialAtIndex: jest.fn(),
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

    mockContract.getMemorialCount.mockResolvedValue({ toNumber: () => 2 });
    mockContract.getMemorialAtIndex.mockImplementation((index: number) => 
      Promise.resolve({
        ipfsHash: `QmHash${index}`,
        timestamp: { toNumber: () => Date.now() - (index * 1000) },
        creator: '0xuserAddress',
      })
    );

    jest.clearAllMocks();
  });

  it('initializes with empty memorials list', () => {
    const { result } = renderHook(() => useMemorialContract());
    expect(result.current.memorials).toEqual([]);
  });

  it('fetches memorials on mount', async () => {
    const { result } = renderHook(() => useMemorialContract());
    
    await act(async () => {
      await result.current.refreshMemorials();
    });

    expect(result.current.memorials).toHaveLength(2);
    expect(result.current.memorials[0].ipfsHash).toBe('QmHash0');
    expect(result.current.memorials[1].ipfsHash).toBe('QmHash1');
  });

  it('preserves memorial successfully', async () => {
    const mockTxResponse = {
      txid: '0xtxid',
      wait: jest.fn().mockResolvedValue({}),
    };

    mockConnex.vendor.sign.mockResolvedValue(mockTxResponse);
    mockContract.interface.encodeFunctionData.mockReturnValue('0xencoded');

    const { result } = renderHook(() => useMemorialContract());
    
    await act(async () => {
      const tx = await result.current.preserveMemorial('QmTestHash');
      await tx.wait();
    });

    expect(mockConnex.vendor.sign).toHaveBeenCalledWith('tx', [
      { to: mockContract.address, value: '0x0', data: '0xencoded' },
    ]);
  });

  it('handles transaction failure', async () => {
    mockConnex.vendor.sign.mockRejectedValue(new Error('Transaction failed'));

    const { result } = renderHook(() => useMemorialContract());
    
    await expect(
      act(async () => {
        await result.current.preserveMemorial('QmTestHash');
      })
    ).rejects.toThrow('Transaction failed');
  });

  it('updates memorials list after preservation', async () => {
    const mockTxResponse = {
      txid: '0xtxid',
      wait: jest.fn().mockResolvedValue({}),
    };

    mockConnex.vendor.sign.mockResolvedValue(mockTxResponse);
    
    const { result } = renderHook(() => useMemorialContract());
    
    await act(async () => {
      const tx = await result.current.preserveMemorial('QmNewHash');
      await tx.wait();
      await result.current.refreshMemorials();
    });

    expect(mockContract.getMemorialCount).toHaveBeenCalled();
    expect(mockContract.getMemorialAtIndex).toHaveBeenCalled();
  });

  it('filters memorials by creator', async () => {
    mockContract.getMemorialAtIndex.mockImplementation((index: number) => 
      Promise.resolve({
        ipfsHash: `QmHash${index}`,
        timestamp: { toNumber: () => Date.now() - (index * 1000) },
        creator: index === 0 ? '0xuserAddress' : '0xotherAddress',
      })
    );

    const { result } = renderHook(() => useMemorialContract());
    
    await act(async () => {
      await result.current.refreshMemorials();
    });

    const userMemorials = result.current.getMemorialsByCreator('0xuserAddress');
    expect(userMemorials).toHaveLength(1);
    expect(userMemorials[0].ipfsHash).toBe('QmHash0');
  });

  it('sorts memorials by timestamp', async () => {
    const { result } = renderHook(() => useMemorialContract());
    
    await act(async () => {
      await result.current.refreshMemorials();
    });

    const sortedMemorials = result.current.getSortedMemorials();
    expect(sortedMemorials[0].timestamp).toBeGreaterThan(sortedMemorials[1].timestamp);
  });

  it('handles contract initialization failure', () => {
    (useWallet as jest.Mock).mockReturnValue({
      connex: null,
      address: null,
    });

    const { result } = renderHook(() => useMemorialContract());
    expect(result.current.contract).toBeNull();
  });

  it('handles memorial fetch errors', async () => {
    mockContract.getMemorialCount.mockRejectedValue(new Error('Fetch failed'));

    const { result } = renderHook(() => useMemorialContract());
    
    await act(async () => {
      await result.current.refreshMemorials().catch(() => {});
    });

    expect(result.current.memorials).toEqual([]);
  });
}); 