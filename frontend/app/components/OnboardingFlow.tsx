'use client'

import React, { useState, useMemo } from 'react';
import { calculateLifeExpectancy, getAvailableCountries, validateFactors, type LifeExpectancyFactors, type LifeExpectancyResult, calculateCarbonFootprint } from '../utils/lifeExpectancy';
import { useSarcophagusContract } from '../hooks/useSarcophagusContract';
import { useNotification } from '../contexts/NotificationContext';
import { useLoading } from '../contexts/LoadingContext';
import { useWallet } from '../contexts/WalletContext';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
}

interface OnboardingFlowProps {
  isOpen: boolean;
  onComplete: (data: any) => void;
  onClose: () => void;
}

export default function OnboardingFlow({ isOpen, onComplete, onClose }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    age: '30',
    gender: 'male' as 'male' | 'female',
    country: 'United States',
    height: '69',
    weight: '154',
    smokingStatus: 'never' as 'never' | 'former' | 'current',
    exerciseLevel: 'moderate' as 'sedentary' | 'moderate' | 'active',
    education: 'medium' as 'low' | 'medium' | 'high',
    income: 'medium' as 'low' | 'medium' | 'high',
    beneficiaries: [{ 
      address: '', 
      percentage: '100',
    }],
    lifeExpectancy: null as LifeExpectancyResult | null,
  });

  const [errors, setErrors] = useState<string[]>([]);
  const { verifyUser } = useSarcophagusContract();
  const { showNotification } = useNotification();
  const { isLoading, setLoading } = useLoading();
  const { account } = useWallet();

  const totalPercentage = useMemo(() => {
    return formData.beneficiaries.reduce((total, beneficiary) => {
      return total + (parseInt(beneficiary.percentage) || 0);
    }, 0);
  }, [formData.beneficiaries]);

  // Calculate personalized carbon footprint
  const carbonFootprint = useMemo(() => {
    if (!formData.age || !formData.gender || !formData.country) return null;
    
    const factors: LifeExpectancyFactors = {
      age: parseInt(formData.age),
      gender: formData.gender,
      country: formData.country,
      smokingStatus: formData.smokingStatus || 'never',
      exerciseLevel: formData.exerciseLevel || 'moderate',
      bmi: 25, // Default BMI
      education: formData.education || 'medium',
      income: formData.income || 'medium'
    };
    
    return calculateCarbonFootprint(factors);
  }, [formData]);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const calculateLifeExpectancyForUser = async () => {
    const factors: LifeExpectancyFactors = {
      country: formData.country,
      age: parseInt(formData.age),
      gender: formData.gender,
      smokingStatus: formData.smokingStatus,
      exerciseLevel: formData.exerciseLevel,
      bmi: formData.height && formData.weight ? 
        (parseFloat(formData.weight) * 703 / (parseFloat(formData.height)**2)) : 22,
      education: formData.education,
      income: formData.income,
    };

    const validationErrors = validateFactors(factors);
    if(validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      const result = await calculateLifeExpectancy(factors);
      updateFormData('lifeExpectancy', result);
      setErrors([]);
      
      // Show notification about data source
      if (result.dataSource === 'WHO API') {
        showNotification(`Life expectancy calculated using real WHO data (${result.lastUpdated})`, 'success');
      } else {
        showNotification('Life expectancy calculated using WHO 2023 data (development mode)', 'info');
      }
    } catch (error) {
       if (error instanceof Error) {
        setErrors([error.message]);
      } else {
        setErrors(['An unknown error occurred.']);
      }
    } finally {
      setLoading(false);
    }
  };

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Sarcophagus',
      description: 'Secure your digital legacy on the blockchain.',
      component: (
        <div className="text-center space-y-4">
          <div className="text-6xl">⚰️</div>
          <p className="text-sarcophagus-300">This wizard will guide you through creating a new Sarcophagus vault to protect your assets.</p>
        </div>
      )
    },
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'This anonymous data helps calculate your life expectancy for the smart contract.',
      component: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-sarcophagus-200">Age *</label>
              <input type="number" value={formData.age} onChange={(e) => updateFormData('age', e.target.value)} className="w-full p-2 bg-sarcophagus-700 rounded"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-sarcophagus-200">Gender *</label>
              <select value={formData.gender} onChange={(e) => updateFormData('gender', e.target.value as 'male' | 'female')} className="w-full p-2 bg-sarcophagus-700 rounded">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-sarcophagus-200">Country of Residence *</label>
            <select value={formData.country} onChange={(e) => updateFormData('country', e.target.value)} className="w-full p-2 bg-sarcophagus-700 rounded">
              {getAvailableCountries().map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      )
    },
    {
      id: 'life-expectancy',
      title: 'Life Expectancy Factors',
      description: 'These additional factors provide a more accurate estimate.',
      component: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-sarcophagus-200">Height (in)</label>
              <input type="number" value={formData.height} onChange={(e) => updateFormData('height', e.target.value)} className="w-full p-2 bg-sarcophagus-700 rounded"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-sarcophagus-200">Weight (lbs)</label>
              <input type="number" value={formData.weight} onChange={(e) => updateFormData('weight', e.target.value)} className="w-full p-2 bg-sarcophagus-700 rounded"/>
            </div>
          </div>
          <button onClick={calculateLifeExpectancyForUser} className="w-full py-2 bg-sarcophagus-700 hover:bg-sarcophagus-600 rounded">
            Calculate My Life Expectancy
          </button>
          {formData.lifeExpectancy && (
            <div className="text-center p-3 bg-sarcophagus-800 rounded-lg">
              <p className="text-lg">Estimated Life Expectancy: <span className="font-bold text-white">{formData.lifeExpectancy.adjustedLifeExpectancy} years</span></p>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'verification',
      title: 'Identity Verification',
      description: 'You need to be verified before creating a vault. For testing, we\'ll use a simple verification.',
      component: (
        <div className="space-y-4">
          <div className="p-4 bg-sarcophagus-800 rounded-lg">
            <p className="text-sarcophagus-300 mb-4">
              For testing purposes, we'll automatically verify your identity using your wallet address and provided information.
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Wallet Address:</strong> {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not connected'}</p>
              <p><strong>Age:</strong> {formData.age}</p>
              <p><strong>Gender:</strong> {formData.gender}</p>
              <p><strong>Country:</strong> {formData.country}</p>
              {formData.lifeExpectancy && (
                <p><strong>Life Expectancy:</strong> {formData.lifeExpectancy.adjustedLifeExpectancy} years</p>
              )}
              {carbonFootprint && (
                <p><strong>Personalized Carbon Footprint:</strong> {carbonFootprint} tons CO2/year</p>
              )}
            </div>
          </div>
          <div className="text-center">
            <button 
              onClick={async () => {
                if (!account) {
                  setErrors(['Please connect your wallet first.']);
                  return;
                }
                try {
                  setLoading('verifyUser', true);
                  // For testing, we'll use a simple verification hash
                  const verificationHash = `ipfs://verification-${Date.now()}`;
                  await verifyUser(account, parseInt(formData.age), verificationHash);
                  showNotification('Identity verified successfully!', 'success');
                  setErrors([]);
                } catch (error) {
                  console.error('Verification error:', error);
                  setErrors(['Failed to verify identity. Please try again.']);
                } finally {
                  setLoading('verifyUser', false);
                }
              }}
              disabled={isLoading.verifyUser || !formData.age || !account}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded"
            >
              {isLoading.verifyUser ? 'Verifying...' : 'Verify My Identity'}
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'beneficiaries',
      title: 'Beneficiaries',
      description: 'Who will inherit your assets?',
      component: (
        <div className="space-y-4">
          {formData.beneficiaries.map((_, index) => (
            <div key={index} className="p-3 bg-sarcophagus-800 rounded-lg space-y-3">
               <div>
                <label className="block text-sm font-medium mb-1 text-sarcophagus-200">Wallet Address *</label>
                <input type="text" value={formData.beneficiaries[index].address} onChange={(e) => {
                  const newBens = [...formData.beneficiaries];
                  newBens[index].address = e.target.value;
                  updateFormData('beneficiaries', newBens);
                }} placeholder="0x..." className="w-full p-2 bg-sarcophagus-700 rounded"/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-sarcophagus-200">Percentage *</label>
                <input type="number" value={formData.beneficiaries[index].percentage} onChange={(e) => {
                  const newBens = [...formData.beneficiaries];
                  newBens[index].percentage = e.target.value;
                  updateFormData('beneficiaries', newBens);
                }} placeholder="%" className="w-full p-2 bg-sarcophagus-700 rounded"/>
              </div>
            </div>
          ))}
          {totalPercentage !== 100 && (
            <p className="text-red-400 text-center">Percentages must add up to 100%. Current: {totalPercentage}%</p>
          )}
        </div>
      )
    },
    {
      id: 'summary',
      title: 'Summary & Confirmation',
      description: 'Review your details and create your Sarcophagus.',
      component: (
        <div className="space-y-3 text-sarcophagus-300">
          <p><strong>Age:</strong> {formData.age}, <strong>Gender:</strong> {formData.gender}, <strong>Country:</strong> {formData.country}</p>
          {formData.lifeExpectancy && <p><strong>Est. Life Expectancy:</strong> {formData.lifeExpectancy.adjustedLifeExpectancy} years</p>}
          {carbonFootprint && <p><strong>Personalized Carbon Footprint:</strong> {carbonFootprint} tons CO2/year</p>}
          <h4 className="font-bold pt-2 border-t border-sarcophagus-600">Beneficiaries</h4>
          {formData.beneficiaries.map((b, i) => <p key={i}>{b.address.slice(0,10)}... gets {b.percentage}%</p>)}
        </div>
      )
    }
  ];

  const canProceed = () => {
    const step = steps[currentStep];
    switch (step.id) {
      case 'basic-info': return !!(formData.age && formData.gender && formData.country);
      case 'life-expectancy': return formData.lifeExpectancy !== null;
      case 'verification': return true; // Verification is handled within the step
      case 'beneficiaries': return totalPercentage === 100 && formData.beneficiaries.every(b => b.address && b.percentage);
      case 'summary': return true;
      default: return true;
    }
  };

  const handleNext = () => { if (canProceed()) setCurrentStep(p => p + 1); };
  const handleBack = () => setCurrentStep(p => p - 1);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-sarcophagus-900 border border-sarcophagus-700 rounded-lg w-full max-w-lg flex flex-col">
        <div className="p-4 border-b border-sarcophagus-700">
          <h2 className="text-lg font-bold text-white">{steps[currentStep].title}</h2>
          <p className="text-sm text-sarcophagus-400">{steps[currentStep].description}</p>
        </div>
        <div className="p-6 overflow-y-auto">
          {steps[currentStep].component}
        </div>
        <div className="p-4 border-t border-sarcophagus-700 flex justify-between items-center">
          <button onClick={handleBack} disabled={currentStep === 0} className="px-4 py-2 rounded bg-sarcophagus-700 disabled:opacity-50">Back</button>
          <div className="flex items-center space-x-2">
            {errors.length > 0 && <div className="text-red-400 text-sm">{errors[0]}</div>}
            <button
              onClick={currentStep === steps.length - 1 ? () => onComplete(formData) : handleNext}
              disabled={!canProceed()}
              className="px-4 py-2 rounded bg-purple-600 text-white disabled:opacity-50"
            >
              {currentStep === steps.length - 1 ? 'Create Vault' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}