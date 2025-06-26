import React, { useState, useEffect } from 'react';

// TypeScript declaration for VeChain wallet
declare global {
  interface Window {
    ethereum?: any;
    connex?: any;
    thor?: any;
  }
}

interface SarcophagusData {
  id: string;
  owner: string;
  beneficiaries: { address: string; percentage: number }[];
  totalValue: string;
  lifeExpectancy: number;
  createdAt: Date;
  status: 'active' | 'pending' | 'distributed';
  deposits: Array<{
    timestamp: Date;
    vet: string;
    vtho: string;
    b3tr: string;
  }>;
  obolRewards: string;
  obolLocked: string;
  obolStake: {
    lockedValue: string;
    lastClaimTime: number;
    startTime: number;
    totalEarned: string;
    pendingRewards: string;
    dailyRewardRate: string;
    isLongTermHolder: boolean;
  };
  deathData?: {
    age: number;
    timestamp: Date;
    bonus: string;
    bonusType: 'carbon' | 'legacy' | 'none';
  };
  securityFeatures: {
    maxBeneficiaries: number;
    minimumDeposit: string;
    minimumLockPeriod: string;
    isPaused: boolean;
  };
}

interface OBOLTokenomics {
  totalSupply: string;
  initialSupply: string;
  rewardSupply: string;
  remainingRewards: string;
  vestingProgress: number;
  dailyAPY: number;
  bonusAPY: number;
  userBalance: string;
  userPendingRewards: string;
}

function App() {
  const [account, setAccount] = useState<string>('');
  const [sarcophagi, setSarcophagi] = useState<SarcophagusData[]>([]);
  const [loading, setLoading] = useState(false);
  const [testMode, setTestMode] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Form states
  const [newSarcophagus, setNewSarcophagus] = useState({
    lifeExpectancy: 80,
    beneficiaries: [{ address: '', percentage: 100 }],
    initialDeposit: { vet: '100', vtho: '50', b3tr: '25' }
  });
  
  const [deathForm, setDeathForm] = useState({
    sarcophagusId: '',
    age: 75,
    timestamp: new Date().toISOString().slice(0, 16)
  });

  const [obolTokenomics, setObolTokenomics] = useState<OBOLTokenomics>({
    totalSupply: '1,000,000,000',
    initialSupply: '50,000,000',
    rewardSupply: '950,000,000',
    remainingRewards: '847,500,000',
    vestingProgress: 25,
    dailyAPY: 15.5,
    bonusAPY: 25.0,
    userBalance: '0',
    userPendingRewards: '0'
  });

  // Security features
  const [securityStatus, setSecurityStatus] = useState({
    maxBeneficiaries: 5,
    minimumDeposit: '0.1',
    minimumLockPeriod: '30 days',
    isPaused: false,
    totalUsers: 1250,
    totalValueLocked: '45,250'
  });

  useEffect(() => {
    // Load demo data
    loadDemoData();
  }, []);

  const loadDemoData = () => {
    // Simulate loading OBOL tokenomics
    setObolTokenomics(prev => ({
      ...prev,
      userBalance: '1,250',
      userPendingRewards: '2,500'
    }));
  };

  const connectWallet = async () => {
    try {
      // Try VeChain first (Connex)
      if (window.connex) {
        const account = await window.connex.thor.account().get();
        if (account) {
          setAccount(account);
          return;
        }
      }
      
      // Try VeChain wallet (Thor)
      if (window.thor) {
        const account = await window.thor.account();
        if (account) {
          setAccount(account);
          return;
        }
      }
      
      // Fallback to Ethereum (MetaMask) for testing
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        return;
      }
      
      // If no wallet found, create a demo account for testing
      if (testMode) {
        const demoAccount = '0x' + Math.random().toString(16).substr(2, 40);
        setAccount(demoAccount);
        alert('Demo mode: Using simulated VeChain wallet for testing');
        return;
      }
      
      alert('Please install VeChain Sync or another VeChain wallet provider');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      
      // In demo mode, create a fallback account
      if (testMode) {
        const demoAccount = '0x' + Math.random().toString(16).substr(2, 40);
        setAccount(demoAccount);
        alert('Demo mode: Using simulated VeChain wallet for testing');
      } else {
        alert('Error connecting wallet. Please try again.');
      }
    }
  };

  const createSarcophagus = async () => {
    if (!account) return;
    
    // Security validation
    if (newSarcophagus.beneficiaries.length > securityStatus.maxBeneficiaries) {
      alert(`Maximum ${securityStatus.maxBeneficiaries} beneficiaries allowed`);
      return;
    }

    const totalPercentage = newSarcophagus.beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
    if (totalPercentage !== 100) {
      alert('Total percentage must equal 100%');
      return;
    }

    const totalDeposit = parseFloat(newSarcophagus.initialDeposit.vet) + 
                        parseFloat(newSarcophagus.initialDeposit.vtho) + 
                        parseFloat(newSarcophagus.initialDeposit.b3tr);
    
    if (totalDeposit < parseFloat(securityStatus.minimumDeposit)) {
      alert(`Minimum deposit is ${securityStatus.minimumDeposit} VET equivalent`);
      return;
    }
    
    setLoading(true);
    try {
      // Simulate contract interaction
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calculate OBOL rewards
      const obolRewards = (parseFloat(newSarcophagus.initialDeposit.vet) * 10).toString();
      
      // Add to local state
      const newSarc: SarcophagusData = {
        id: Date.now().toString(),
        owner: account,
        beneficiaries: newSarcophagus.beneficiaries,
        totalValue: `${totalDeposit} VET`,
        lifeExpectancy: newSarcophagus.lifeExpectancy,
        createdAt: new Date(),
        status: 'active',
        deposits: [{
          timestamp: new Date(),
          vet: newSarcophagus.initialDeposit.vet,
          vtho: newSarcophagus.initialDeposit.vtho,
          b3tr: newSarcophagus.initialDeposit.b3tr
        }],
        obolRewards,
        obolLocked: '0',
        obolStake: {
          lockedValue: '0',
          lastClaimTime: Date.now(),
          startTime: Date.now(),
          totalEarned: obolRewards,
          pendingRewards: obolRewards,
          dailyRewardRate: '10',
          isLongTermHolder: false
        },
        securityFeatures: {
          maxBeneficiaries: securityStatus.maxBeneficiaries,
          minimumDeposit: securityStatus.minimumDeposit,
          minimumLockPeriod: securityStatus.minimumLockPeriod,
          isPaused: false
        }
      };
      
      setSarcophagi(prev => [newSarc, ...prev]);
      
      // Update OBOL tokenomics
      setObolTokenomics(prev => ({
        ...prev,
        userBalance: (parseFloat(prev.userBalance.replace(/,/g, '')) + parseFloat(obolRewards)).toLocaleString(),
        userPendingRewards: (parseFloat(prev.userPendingRewards.replace(/,/g, '')) + parseFloat(obolRewards)).toLocaleString()
      }));
      
      alert('Sarcophagus created and funded successfully! (Demo Mode)');
    } catch (error) {
      console.error('Error creating sarcophagus:', error);
      alert('Error creating sarcophagus. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const simulateDeath = async () => {
    if (!deathForm.sarcophagusId) return;
    
    setLoading(true);
    try {
      // Simulate contract interaction
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const sarcophagus = sarcophagi.find(s => s.id === deathForm.sarcophagusId);
      if (!sarcophagus) throw new Error('Sarcophagus not found');
      
      // Calculate bonus type
      let bonusType: 'carbon' | 'legacy' | 'none' = 'none';
      let bonusAmount = '0';
      
      if (deathForm.age < sarcophagus.lifeExpectancy) {
        bonusType = 'carbon';
        bonusAmount = (parseFloat(sarcophagus.obolRewards) * 0.15).toString(); // 15% carbon bonus
      } else {
        bonusType = 'legacy';
        bonusAmount = (parseFloat(sarcophagus.obolRewards) * 0.25).toString(); // 25% legacy bonus
      }
      
      // Update local state
      setSarcophagi(prev => prev.map(s => 
        s.id === deathForm.sarcophagusId 
          ? { 
              ...s, 
              status: 'distributed', 
              deathData: { 
                age: deathForm.age, 
                timestamp: new Date(deathForm.timestamp), 
                bonus: bonusAmount, 
                bonusType 
              } 
            }
          : s
      ));
      
      alert(`Death verified! Bonus type: ${bonusType} (${bonusAmount} OBOL) - Demo Mode`);
    } catch (error) {
      console.error('Error simulating death:', error);
      alert('Error simulating death. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const claimObolRewards = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update OBOL balance
      setObolTokenomics(prev => ({
        ...prev,
        userBalance: (parseFloat(prev.userBalance.replace(/,/g, '')) + parseFloat(prev.userPendingRewards.replace(/,/g, ''))).toLocaleString(),
        userPendingRewards: '0'
      }));
      
      alert('OBOL rewards claimed successfully! (Demo Mode)');
    } catch (error) {
      console.error('Error claiming rewards:', error);
      alert('Error claiming rewards. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const addBeneficiary = () => {
    if (newSarcophagus.beneficiaries.length >= securityStatus.maxBeneficiaries) {
      alert(`Maximum ${securityStatus.maxBeneficiaries} beneficiaries allowed`);
      return;
    }
    
    setNewSarcophagus(prev => ({
      ...prev,
      beneficiaries: [...prev.beneficiaries, { address: '', percentage: 0 }]
    }));
  };

  const updateBeneficiary = (index: number, field: 'address' | 'percentage', value: string | number) => {
    setNewSarcophagus(prev => ({
      ...prev,
      beneficiaries: prev.beneficiaries.map((b, i) => 
        i === index ? { ...b, [field]: value } : b
      )
    }));
  };

  const removeBeneficiary = (index: number) => {
    setNewSarcophagus(prev => ({
      ...prev,
      beneficiaries: prev.beneficiaries.filter((_, i) => i !== index)
    }));
  };

  const startTutorial = () => {
    setShowTutorial(true);
    setCurrentStep(0);
  };

  const nextTutorialStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowTutorial(false);
    }
  };

  const tutorialSteps = [
    {
      title: "Welcome to Sarcophagus Protocol!",
      content: "This is a digital inheritance platform that automatically distributes your assets when you pass away.",
      action: "Let's get started!"
    },
    {
      title: "Create Your Digital Vault",
      content: "Set up your sarcophagus with beneficiaries and initial deposits. You'll earn OBOL rewards!",
      action: "Next"
    },
    {
      title: "Security Features",
      content: "Maximum 5 beneficiaries, minimum deposits, and comprehensive validation keep your assets safe.",
      action: "Next"
    },
    {
      title: "OBOL Reward System",
      content: "Earn 10 OBOL per 1 VET deposited, plus bonuses for environmental consciousness or longevity.",
      action: "Next"
    },
    {
      title: "Ready to Test!",
      content: "Connect your wallet and start creating your digital legacy. Everything is simulated for safe testing.",
      action: "Start Testing!"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🏺 Sarcophagus Protocol - Test dApp</h1>
          <p className="text-gray-300">Advanced Digital Inheritance Platform on VeChain (Demo Mode)</p>
          
          {/* Security Status Banner */}
          <div className="mt-4 p-4 bg-green-900/30 rounded-lg border border-green-500/30">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-400">Security Status: VERIFIED</h3>
                <p className="text-sm text-gray-300">
                  Max Beneficiaries: {securityStatus.maxBeneficiaries} | 
                  Min Deposit: {securityStatus.minimumDeposit} VET | 
                  Lock Period: {securityStatus.minimumLockPeriod} |
                  Total Users: {securityStatus.totalUsers.toLocaleString()} |
                  TVL: {securityStatus.totalValueLocked} VET
                </p>
              </div>
            </div>
          </div>
          
          {/* OBOL Tokenomics */}
          <div className="mt-4 p-4 bg-green-900/30 rounded-lg border border-green-500/30">
            <h3 className="text-lg font-semibold text-green-400 mb-2">🪙 $OBOL Tokenomics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-green-400 font-semibold">Your Balance:</span>
                <span className="text-gray-300 ml-2">{obolTokenomics.userBalance} OBOL</span>
              </div>
              <div>
                <span className="text-blue-400 font-semibold">Pending Rewards:</span>
                <span className="text-gray-300 ml-2">{obolTokenomics.userPendingRewards} OBOL</span>
              </div>
              <div>
                <span className="text-yellow-400 font-semibold">Daily APY:</span>
                <span className="text-gray-300 ml-2">{obolTokenomics.dailyAPY}%</span>
              </div>
              <div>
                <span className="text-purple-400 font-semibold">Bonus APY:</span>
                <span className="text-gray-300 ml-2">{obolTokenomics.bonusAPY}%</span>
              </div>
            </div>
            {parseFloat(obolTokenomics.userPendingRewards) > 0 && (
              <button
                onClick={claimObolRewards}
                disabled={loading}
                className="mt-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 rounded-lg transition-colors text-white"
              >
                {loading ? 'Claiming...' : 'Claim OBOL Rewards'}
              </button>
            )}
          </div>
          
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="testMode"
                checked={testMode}
                onChange={(e) => setTestMode(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="testMode" className="text-white">Demo Mode (Simulated Blockchain)</label>
            </div>
            <button
              onClick={startTutorial}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
            >
              📖 Tutorial
            </button>
            {!account ? (
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Connect Wallet
              </button>
            ) : (
              <span className="text-gray-300 text-sm">
                Connected: {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            )}
          </div>
        </div>

        {/* Tutorial Modal */}
        {showTutorial && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#1a1f2e] rounded-2xl p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-purple-400 mb-4">{tutorialSteps[currentStep].title}</h2>
              <p className="text-gray-300 mb-6">{tutorialSteps[currentStep].content}</p>
              <div className="flex justify-between">
                <button
                  onClick={() => setShowTutorial(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={nextTutorialStep}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
                >
                  {tutorialSteps[currentStep].action}
                </button>
              </div>
            </div>
          </div>
        )}

        {!account ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🔗</div>
            <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-gray-300 mb-8">Connect your wallet to start testing the Sarcophagus Protocol</p>
            <button
              onClick={connectWallet}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create Sarcophagus */}
            <div className="bg-[#1a1f2e] rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-purple-400 mb-4">🏗️ Create Sarcophagus</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Life Expectancy (years)</label>
                  <input
                    type="number"
                    value={newSarcophagus.lifeExpectancy}
                    onChange={(e) => setNewSarcophagus(prev => ({ ...prev, lifeExpectancy: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 bg-[#2d3748] rounded-lg border border-gray-600 text-white"
                    min="50"
                    max="120"
                  />
                  <p className="text-xs text-gray-400 mt-1">Determines your bonus type (Carbon Offset vs Legacy)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Beneficiaries ({newSarcophagus.beneficiaries.length}/{securityStatus.maxBeneficiaries})
                  </label>
                  {newSarcophagus.beneficiaries.map((beneficiary, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        placeholder="Address"
                        value={beneficiary.address}
                        onChange={(e) => updateBeneficiary(index, 'address', e.target.value)}
                        className="flex-1 px-3 py-2 bg-[#2d3748] rounded-lg border border-gray-600 text-white"
                      />
                      <input
                        type="number"
                        placeholder="%"
                        value={beneficiary.percentage}
                        onChange={(e) => updateBeneficiary(index, 'percentage', parseInt(e.target.value))}
                        className="w-20 px-3 py-2 bg-[#2d3748] rounded-lg border border-gray-600 text-white"
                        min="0"
                        max="100"
                      />
                      {newSarcophagus.beneficiaries.length > 1 && (
                        <button
                          onClick={() => removeBeneficiary(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addBeneficiary}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                    disabled={newSarcophagus.beneficiaries.length >= securityStatus.maxBeneficiaries}
                  >
                    + Add Beneficiary
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Initial Deposit</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      placeholder="VET"
                      value={newSarcophagus.initialDeposit.vet}
                      onChange={(e) => setNewSarcophagus(prev => ({ 
                        ...prev, 
                        initialDeposit: { ...prev.initialDeposit, vet: e.target.value }
                      }))}
                      className="px-3 py-2 bg-[#2d3748] rounded-lg border border-gray-600 text-white"
                    />
                    <input
                      type="number"
                      placeholder="VTHO"
                      value={newSarcophagus.initialDeposit.vtho}
                      onChange={(e) => setNewSarcophagus(prev => ({ 
                        ...prev, 
                        initialDeposit: { ...prev.initialDeposit, vtho: e.target.value }
                      }))}
                      className="px-3 py-2 bg-[#2d3748] rounded-lg border border-gray-600 text-white"
                    />
                    <input
                      type="number"
                      placeholder="B3TR"
                      value={newSarcophagus.initialDeposit.b3tr}
                      onChange={(e) => setNewSarcophagus(prev => ({ 
                        ...prev, 
                        initialDeposit: { ...prev.initialDeposit, b3tr: e.target.value }
                      }))}
                      className="px-3 py-2 bg-[#2d3748] rounded-lg border border-gray-600 text-white"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Minimum: {securityStatus.minimumDeposit} VET equivalent</p>
                </div>

                <button
                  onClick={createSarcophagus}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Sarcophagus (Demo)'}
                </button>
              </div>
            </div>

            {/* Simulate Death */}
            <div className="bg-[#1a1f2e] rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-red-400 mb-4">💀 Simulate Death</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Sarcophagus</label>
                  <select
                    value={deathForm.sarcophagusId}
                    onChange={(e) => setDeathForm(prev => ({ ...prev, sarcophagusId: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#2d3748] rounded-lg border border-gray-600 text-white"
                  >
                    <option value="">Select a sarcophagus</option>
                    {sarcophagi.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.id} - {s.owner.slice(0, 6)}...{s.owner.slice(-4)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Age at Death</label>
                  <input
                    type="number"
                    value={deathForm.age}
                    onChange={(e) => setDeathForm(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 bg-[#2d3748] rounded-lg border border-gray-600 text-white"
                    min="18"
                    max="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Death Timestamp</label>
                  <input
                    type="datetime-local"
                    value={deathForm.timestamp}
                    onChange={(e) => setDeathForm(prev => ({ ...prev, timestamp: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#2d3748] rounded-lg border border-gray-600 text-white"
                  />
                </div>

                <button
                  onClick={simulateDeath}
                  disabled={loading || !deathForm.sarcophagusId}
                  className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Simulating...' : 'Simulate Death (Demo)'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sarcophagi List */}
        {account && (
          <div className="mt-8 bg-[#1a1f2e] rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-green-400 mb-4">📋 Sarcophagi Overview</h2>
            
            {sarcophagi.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400">No sarcophagi found. Create one to get started!</div>
              </div>
            ) : (
              <div className="space-y-4">
                {sarcophagi.map((sarcophagus) => (
                  <div key={sarcophagus.id} className="bg-[#2d3748] rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Sarcophagus #{sarcophagus.id}</h3>
                        <p className="text-sm text-gray-400">Owner: {sarcophagus.owner}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        sarcophagus.status === 'active' ? 'bg-green-600 text-white' :
                        sarcophagus.status === 'distributed' ? 'bg-red-600 text-white' :
                        'bg-yellow-600 text-white'
                      }`}>
                        {sarcophagus.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                      <div>
                        <span className="text-gray-400 text-sm">Total Value:</span>
                        <div className="text-white font-semibold">{sarcophagus.totalValue}</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">OBOL Rewards:</span>
                        <div className="text-green-400 font-semibold">{sarcophagus.obolRewards} OBOL</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Life Expectancy:</span>
                        <div className="text-white font-semibold">{sarcophagus.lifeExpectancy} years</div>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <span className="text-gray-400 text-sm">Beneficiaries:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {sarcophagus.beneficiaries.map((beneficiary, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                            {beneficiary.address.slice(0, 6)}...{beneficiary.address.slice(-4)} ({beneficiary.percentage}%)
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {sarcophagus.deathData && (
                      <div className="mt-2 p-2 bg-red-900/30 rounded border border-red-500/30">
                        <span className="text-red-400 text-sm font-semibold">Death Verified:</span>
                        <div className="text-sm text-gray-300">
                          Age: {sarcophagus.deathData.age} | 
                          Bonus: {sarcophagus.deathData.bonus} OBOL ({sarcophagus.deathData.bonusType})
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
