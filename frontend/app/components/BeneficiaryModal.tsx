'use client';

import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../hooks/useContract';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Beneficiary {
  address: string;
  percentage: number;
  age: number;
  guardian?: string;
  contingentBeneficiary?: string;
  survivorshipPeriod?: number;
  successorGuardian?: string;
  contactInfo?: string;
}

interface BeneficiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (beneficiaries: Beneficiary[], charityAddress?: string) => void;
}

// Mock ABI for now - replace with actual ABI import
const SARCOPHAGUS_ABI = [
  'function createSarcophagusWithGuardians(address[] memory beneficiaries, uint256[] memory percentages, address[] memory guardians, uint256[] memory ages) external',
  'function updateBeneficiaryEnhanced(uint256 index, address contingentBeneficiary, uint256 survivorshipPeriod, address successorGuardian, string memory contactInfo) external',
  'function designateCharity(address charityAddress) external'
];

export default function BeneficiaryModal({ isOpen, onClose, onComplete }: BeneficiaryModalProps) {
  const { account } = useWallet();
  const { contract: sarcophagusContract } = useContract('SARCOPHAGUS_CONTRACT_ADDRESS', SARCOPHAGUS_ABI);
  
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    { address: '', percentage: 100, age: 18 }
  ]);
  const [charityAddress, setCharityAddress] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const addBeneficiary = () => {
    if (beneficiaries.length < 5) {
      setBeneficiaries([...beneficiaries, { address: '', percentage: 0, age: 18 }]);
    }
  };

  const removeBeneficiary = (index: number) => {
    if (beneficiaries.length > 1) {
      const newBeneficiaries = beneficiaries.filter((_, i) => i !== index);
      // Recalculate percentages
      const totalPercentage = newBeneficiaries.reduce((sum, b) => sum + b.percentage, 0);
      if (totalPercentage !== 100) {
        // Distribute remaining percentage equally
        const equalShare = Math.floor(100 / newBeneficiaries.length);
        const remainder = 100 - (equalShare * newBeneficiaries.length);
        newBeneficiaries.forEach((beneficiary, i) => {
          beneficiary.percentage = equalShare + (i < remainder ? 1 : 0);
        });
      }
      setBeneficiaries(newBeneficiaries);
    }
  };

  const updateBeneficiary = (index: number, field: keyof Beneficiary, value: any) => {
    const newBeneficiaries = [...beneficiaries];
    newBeneficiaries[index] = { ...newBeneficiaries[index], [field]: value };
    
    // If percentage changed, recalculate others
    if (field === 'percentage') {
      const currentTotal = newBeneficiaries.reduce((sum, b, i) => i === index ? sum : sum + b.percentage, 0);
      const newTotal = currentTotal + value;
      
      if (newTotal > 100) {
        // Reduce other percentages proportionally
        const excess = newTotal - 100;
        const otherBeneficiaries = newBeneficiaries.filter((_, i) => i !== index);
        const otherTotal = otherBeneficiaries.reduce((sum, b) => sum + b.percentage, 0);
        
        if (otherTotal > 0) {
          otherBeneficiaries.forEach((beneficiary, i) => {
            const reduction = (beneficiary.percentage / otherTotal) * excess;
            beneficiary.percentage = Math.max(0, beneficiary.percentage - reduction);
          });
        }
      }
    }
    
    setBeneficiaries(newBeneficiaries);
  };

  const validateBeneficiaries = (): boolean => {
    const totalPercentage = beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
    if (totalPercentage !== 100) return false;
    
    for (const beneficiary of beneficiaries) {
      if (!beneficiary.address || beneficiary.address === account) return false;
      if (beneficiary.age < 0 || beneficiary.age > 120) return false;
      if (beneficiary.age < 18 && !beneficiary.guardian) return false;
      if (beneficiary.survivorshipPeriod && beneficiary.survivorshipPeriod > 365) return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateBeneficiaries()) return;
    
    setIsLoading(true);
    try {
      // Call the enhanced contract function
      const addresses = beneficiaries.map(b => b.address);
      const percentages = beneficiaries.map(b => b.percentage * 100); // Convert to basis points
      const guardians = beneficiaries.map(b => b.guardian || '0x0000000000000000000000000000000000000000');
      const ages = beneficiaries.map(b => b.age);
      
      if (sarcophagusContract) {
        const tx = await sarcophagusContract.createSarcophagusWithGuardians(
          addresses,
          percentages,
          guardians,
          ages
        );
        await tx.wait();
        
        // Update beneficiaries with enhanced information
        for (let i = 0; i < beneficiaries.length; i++) {
          const beneficiary = beneficiaries[i];
          if (beneficiary.contingentBeneficiary || beneficiary.survivorshipPeriod || 
              beneficiary.successorGuardian || beneficiary.contactInfo) {
            await sarcophagusContract.updateBeneficiaryEnhanced(
              i,
              beneficiary.contingentBeneficiary || '0x0000000000000000000000000000000000000000',
              beneficiary.survivorshipPeriod || 0,
              beneficiary.successorGuardian || '0x0000000000000000000000000000000000000000',
              beneficiary.contactInfo || ''
            );
          }
        }
        
        // Designate charity if provided
        if (charityAddress) {
          await sarcophagusContract.designateCharity(charityAddress);
        }
      }
      
      onComplete(beneficiaries, charityAddress);
    } catch (error) {
      console.error('Error creating sarcophagus:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPercentage = beneficiaries.reduce((sum, b) => sum + b.percentage, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Designate Beneficiaries</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Beneficiary Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Primary Beneficiaries</h3>
            {beneficiaries.map((beneficiary, index) => (
              <div key={index} className="border rounded-lg p-4 mb-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Beneficiary Address
                    </label>
                    <input
                      type="text"
                      value={beneficiary.address}
                      onChange={(e) => updateBeneficiary(index, 'address', e.target.value)}
                      placeholder="0x..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Percentage ({beneficiary.percentage}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={beneficiary.percentage}
                      onChange={(e) => updateBeneficiary(index, 'percentage', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={beneficiary.age}
                      onChange={(e) => updateBeneficiary(index, 'age', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Guardian for minors */}
                {beneficiary.age < 18 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guardian Address (Required for minors)
                    </label>
                    <input
                      type="text"
                      value={beneficiary.guardian || ''}
                      onChange={(e) => updateBeneficiary(index, 'guardian', e.target.value)}
                      placeholder="0x..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Advanced Options */}
                {showAdvanced && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-medium text-gray-700">Advanced Options</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contingent Beneficiary
                        </label>
                        <input
                          type="text"
                          value={beneficiary.contingentBeneficiary || ''}
                          onChange={(e) => updateBeneficiary(index, 'contingentBeneficiary', e.target.value)}
                          placeholder="Backup beneficiary address"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Survivorship Period (days)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="365"
                          value={beneficiary.survivorshipPeriod || 0}
                          onChange={(e) => updateBeneficiary(index, 'survivorshipPeriod', parseInt(e.target.value))}
                          placeholder="0 = no requirement"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Successor Guardian
                        </label>
                        <input
                          type="text"
                          value={beneficiary.successorGuardian || ''}
                          onChange={(e) => updateBeneficiary(index, 'successorGuardian', e.target.value)}
                          placeholder="Backup guardian address"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Info (IPFS Hash)
                        </label>
                        <input
                          type="text"
                          value={beneficiary.contactInfo || ''}
                          onChange={(e) => updateBeneficiary(index, 'contactInfo', e.target.value)}
                          placeholder="Qm..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => removeBeneficiary(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                    disabled={beneficiaries.length === 1}
                  >
                    Remove Beneficiary
                  </button>
                  
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                  </button>
                </div>
              </div>
            ))}
            
            <button
              onClick={addBeneficiary}
              disabled={beneficiaries.length >= 5}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add Beneficiary ({beneficiaries.length}/5)
            </button>
          </div>

          {/* Charity Designation */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Charity Fallback</h3>
            <p className="text-sm text-gray-600 mb-4">
              Designate a charity to receive your estate if all beneficiaries are deceased or incapacitated.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Charity Address (Optional)
              </label>
              <input
                type="text"
                value={charityAddress}
                onChange={(e) => setCharityAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Validation */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium">Total Percentage: {totalPercentage}%</span>
              <span className={`text-sm ${totalPercentage === 100 ? 'text-green-600' : 'text-red-600'}`}>
                {totalPercentage === 100 ? '✓ Valid' : '✗ Must equal 100%'}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div>• Maximum 5 beneficiaries allowed</div>
              <div>• Minors (under 18) require a guardian</div>
              <div>• Survivorship periods can be 0-365 days</div>
              <div>• Contingent beneficiaries provide backup inheritance</div>
              <div>• Charity receives estate if no valid beneficiaries exist</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!validateBeneficiaries() || isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Sarcophagus'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 