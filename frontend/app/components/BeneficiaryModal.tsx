'use client';

import { useState, useEffect } from 'react';
import { useVereavementContract } from '../hooks/useVereavementContract';
import { useNotification } from '../contexts/NotificationContext';
import { useLoading } from '../contexts/LoadingContext';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface BeneficiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Beneficiary {
  address: string;
  percentage: number;
}

export default function BeneficiaryModal({ isOpen, onClose }: BeneficiaryModalProps) {
  const [address, setAddress] = useState('');
  const [percentage, setPercentage] = useState('');
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const { addBeneficiary, getBeneficiaries, removeBeneficiary } = useVereavementContract();
  const { showNotification } = useNotification();
  const { isLoading, setLoading } = useLoading();

  useEffect(() => {
    if (isOpen) {
      fetchBeneficiaries();
    }
  }, [isOpen]);

  const fetchBeneficiaries = async () => {
    setLoading('fetchBeneficiaries', true);
    try {
      const result = await getBeneficiaries();
      setBeneficiaries(result);
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
      showNotification('Failed to fetch beneficiaries', 'error');
    }
    setLoading('fetchBeneficiaries', false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !percentage) {
      showNotification('Please fill in all fields', 'warning');
      return;
    }

    const percentageNum = parseInt(percentage);
    if (isNaN(percentageNum) || percentageNum <= 0 || percentageNum > 100) {
      showNotification('Percentage must be between 1 and 100', 'warning');
      return;
    }

    // Check total percentage
    const totalPercentage = beneficiaries.reduce((sum, b) => sum + b.percentage, 0) + percentageNum;
    if (totalPercentage > 100) {
      showNotification('Total percentage cannot exceed 100%', 'warning');
      return;
    }

    setLoading('addBeneficiary', true);
    try {
      const tx = await addBeneficiary(address, percentageNum);
      showNotification('Adding beneficiary...', 'info');
      await tx.wait();
      showNotification('Beneficiary added successfully!', 'success');
      await fetchBeneficiaries();
      setAddress('');
      setPercentage('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding beneficiary:', error);
      showNotification('Failed to add beneficiary', 'error');
    }
    setLoading('addBeneficiary', false);
  };

  const handleRemove = async (beneficiaryAddress: string) => {
    setLoading(`removeBeneficiary-${beneficiaryAddress}`, true);
    try {
      const tx = await removeBeneficiary(beneficiaryAddress);
      showNotification('Removing beneficiary...', 'info');
      await tx.wait();
      showNotification('Beneficiary removed successfully!', 'success');
      await fetchBeneficiaries();
    } catch (error) {
      console.error('Error removing beneficiary:', error);
      showNotification('Failed to remove beneficiary', 'error');
    }
    setLoading(`removeBeneficiary-${beneficiaryAddress}`, false);
  };

  const shortenAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1f2e] rounded-2xl p-8 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-pink-400">Manage Beneficiaries</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* Beneficiaries List */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-300">Current Beneficiaries</h3>
            <button
              onClick={() => setShowAddForm(true)}
              disabled={isLoading.fetchBeneficiaries}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700 transition-colors ${
                isLoading.fetchBeneficiaries ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <PlusIcon className="w-5 h-5" />
              Add New
            </button>
          </div>

          {isLoading.fetchBeneficiaries ? (
            <div className="text-gray-400">Loading beneficiaries...</div>
          ) : beneficiaries.length === 0 ? (
            <div className="text-gray-400">No beneficiaries added yet</div>
          ) : (
            <div className="space-y-3">
              {beneficiaries.map((beneficiary) => (
                <div
                  key={beneficiary.address}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                >
                  <div>
                    <div className="text-white font-medium">{shortenAddress(beneficiary.address)}</div>
                    <div className="text-gray-400 text-sm">{beneficiary.percentage}% Share</div>
                  </div>
                  <button
                    onClick={() => handleRemove(beneficiary.address)}
                    disabled={isLoading[`removeBeneficiary-${beneficiary.address}`]}
                    className={`p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors ${
                      isLoading[`removeBeneficiary-${beneficiary.address}`] ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <div className="mt-4 text-right text-gray-400 text-sm">
                Total Allocation: {beneficiaries.reduce((sum, b) => sum + b.percentage, 0)}%
              </div>
            </div>
          )}
        </div>

        {/* Add Beneficiary Form */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className="border-t border-gray-700 pt-6">
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Beneficiary Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-gray-800 rounded-lg px-4 py-2 text-white"
                placeholder="0x..."
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Percentage Share</label>
              <input
                type="number"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                className="w-full bg-gray-800 rounded-lg px-4 py-2 text-white"
                placeholder="1-100"
                min="1"
                max="100"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading.addBeneficiary}
                className={`px-6 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:opacity-90 transition-opacity ${
                  isLoading.addBeneficiary ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading.addBeneficiary ? 'Adding...' : 'Add Beneficiary'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 