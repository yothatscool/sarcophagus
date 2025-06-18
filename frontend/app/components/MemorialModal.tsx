'use client';

import { useState } from 'react';
import { useVereavementContract } from '../hooks/useVereavementContract';
import { useNotification } from '../contexts/NotificationContext';
import { useLoading } from '../contexts/LoadingContext';

interface MemorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MemorialModal({ isOpen, onClose }: MemorialModalProps) {
  const [memorialText, setMemorialText] = useState('');
  const { preserveMemorial } = useVereavementContract();
  const { showNotification } = useNotification();
  const { isLoading, setLoading } = useLoading();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memorialText.trim()) {
      showNotification('Please enter memorial text', 'warning');
      return;
    }

    setLoading('preserveMemorial', true);
    try {
      // In a real implementation, you would hash and store the memorial text on IPFS
      // For now, we'll just use the text directly
      const memorialHash = memorialText; // Replace with IPFS hash in production
      const tx = await preserveMemorial(memorialHash);
      showNotification('Preserving memorial...', 'info');
      await tx.wait();
      showNotification('Memorial preserved successfully!', 'success');
      onClose();
      setMemorialText('');
    } catch (error) {
      console.error('Error preserving memorial:', error);
      showNotification('Failed to preserve memorial', 'error');
    }
    setLoading('preserveMemorial', false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1f2e] rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-teal-400 mb-6">Preserve Memorial</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Memorial Text</label>
            <textarea
              value={memorialText}
              onChange={(e) => setMemorialText(e.target.value)}
              className="w-full bg-gray-800 rounded-lg px-4 py-2 text-white h-32 resize-none"
              placeholder="Enter your memorial message..."
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading.preserveMemorial}
              className={`px-6 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:opacity-90 transition-opacity ${
                isLoading.preserveMemorial ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading.preserveMemorial ? 'Preserving...' : 'Preserve Memorial'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 