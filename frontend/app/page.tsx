'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { useSarcophagusContract } from './hooks/useSarcophagusContract'
import { useContractEvents } from './hooks/useContractEvents'
import { useNotification } from './contexts/NotificationContext'
import { useWallet } from './contexts/WalletContext'
import { useLoading } from './contexts/LoadingContext'
import BeneficiaryModal from './components/BeneficiaryModal'
import OnboardingFlow from './components/OnboardingFlow'
import VaultManagementModal from './components/VaultManagementModal'
import { calculateLifeExpectancy, type LifeExpectancyResult } from './utils/lifeExpectancy'
import { getCurrentNetworkAddresses } from './config/contracts'
import UserJourney from './components/UserJourney'
import Header from './components/Header'
import LegalDisclosure from './components/LegalDisclosure'
import { useLegalAcceptance } from './hooks/useLegalAcceptance'
import Dashboard from './components/Dashboard'

interface VaultData {
  id: string;
  owner: string;
  beneficiaries: { address: string; percentage: number }[];
  totalValue: string;
  lifeExpectancy: number;
  createdAt: Date;
  status: 'active' | 'pending' | 'distributed';
  obolRewards: string;
  obolLocked: string;
  vetAmount: string;
  vthoAmount: string;
  b3trAmount: string;
  isDeceased: boolean;
  deathTimestamp?: number;
  actualAge?: number;
}

interface OBOLTokenomics {
  totalSupply: string;
  initialSupply: string;
  rewardSupply: string;
  rewardRate: string;
  remainingRewards: string;
  vestingProgress: number;
  dailyAPY: number;
  bonusAPY: number;
  userStake: {
    lockedValue: string;
    lastClaimTime: number;
    startTime: number;
    totalEarned: string;
    pendingRewards: string;
    dailyRewardRate: string;
    isLongTermHolder: boolean;
  };
}

interface B3TRTokenomics {
  totalSupply: string;
  carbonOffsetRate: string;
  legacyBonusRate: string;
  grandfatheringMultiplier: string;
  userRewards: {
    carbonOffset: string;
    legacyBonus: string;
    grandfatheringEligible: boolean;
    timeRemaining: string;
  };
}

export default function Home() {
  const { account, disconnect } = useWallet()
  const isConnected = !!account
  const { showNotification, showTransactionNotification } = useNotification()
  const { isLoading, setLoading } = useLoading()
  const [isBeneficiaryModalOpen, setBeneficiaryModalOpen] = useState(false)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(true)
  const [userAge, setUserAge] = useState('')
  const [verificationHash, setVerificationHash] = useState('')
  const [vetAmount, setVetAmount] = useState('')
  const [vthoAmount, setVthoAmount] = useState('')
  const [b3trAmount, setB3trAmount] = useState('')
  const [obolAmount, setObolAmount] = useState('')
  const [deceasedAddress, setDeceasedAddress] = useState('')
  const [deathAge, setDeathAge] = useState('')
  const [lifeExpectancy, setLifeExpectancy] = useState('')
  const [deathProofHash, setDeathProofHash] = useState('')
  const [showVaultManagement, setShowVaultManagement] = useState(false)
  const [selectedVault, setSelectedVault] = useState<VaultData | null>(null)
  const [vaultModalTab, setVaultModalTab] = useState<'deposit' | 'obol' | 'b3tr' | 'beneficiaries' | 'info'>('deposit')
  const [userLifeExpectancy, setUserLifeExpectancy] = useState<LifeExpectancyResult | null>(null)
  const [vaults, setVaults] = useState<VaultData[]>([])
  const [obolTokenomics, setObolTokenomics] = useState<OBOLTokenomics | null>(null)
  const [userObolBalance, setUserObolBalance] = useState('0')
  const [userObolRewards, setUserObolRewards] = useState('0')
  const [b3trTokenomics, setB3trTokenomics] = useState<B3TRTokenomics | null>(null)
  const [userB3TRRewards, setUserB3TRRewards] = useState('0')
  
  // Security features
  const [securityStatus, setSecurityStatus] = useState({
    maxBeneficiaries: 5,
    minimumDeposit: '0.1',
    isPaused: false,
    totalUsers: 0,
    totalValueLocked: '0'
  })

  const {
    userSarcophagus,
    userBeneficiaries,
    isUserVerified,
    hasSarcophagus,
    verifyUser,
    createSarcophagus,
    depositTokens,
    lockObolTokens,
    claimObolRewards,
    verifyDeath,
    claimInheritance,
    refreshUserData
  } = useSarcophagusContract()

  const { 
    hasAcceptedAllTerms, 
    showLegalDisclosure, 
    acceptAllTerms, 
    declineTerms 
  } = useLegalAcceptance(account)

  // Handle contract events
  useContractEvents((eventName, data) => {
    switch (eventName) {
      case 'UserVerified':
        showNotification(`User ${data.user} verified successfully`, 'success')
        break
      case 'SarcophagusCreated':
        showNotification(`Sarcophagus created for ${data.user}`, 'success')
        break
      case 'TokensDeposited':
        showNotification(`${data.vetAmount} VET deposited`, 'success')
        break
      case 'ObolTokensLocked':
        showNotification(`${data.obolAmount} OBOL locked in vault`, 'success')
        break
      case 'VaultRewardMinted':
        showNotification(`${data.amount} OBOL rewards earned!`, 'success')
        break
      case 'DeathVerified':
        showNotification(`Death verified for ${data.user}`, 'info')
        break
      case 'InheritanceClaimed':
        showNotification(`Inheritance claimed: ${data.vetShare} VET`, 'success')
        break
      case 'ContinuousRewardClaimed':
        showNotification(`${data.amount} OBOL continuous rewards claimed!`, 'success')
        break
    }
  })

  useEffect(() => {
    if (isConnected && account) {
      refreshUserData()
      loadB3TRData()
      loadSecurityStatus()
      loadOBOLData()
    }
  }, [isConnected, account])

  const loadB3TRData = async () => {
    try {
      // Enhanced B3TR tokenomics data based on personalized carbon calculations
      setB3trTokenomics({
        totalSupply: 'Unlimited (from Vebetter DAO)',
        carbonOffsetRate: 'Years saved × personalized CO2 footprint/year',
        legacyBonusRate: '100 B3TR for reaching life expectancy + 100 B3TR per year past it',
        grandfatheringMultiplier: 'N/A',
        userRewards: {
          carbonOffset: '0',
          legacyBonus: '0',
          grandfatheringEligible: false,
          timeRemaining: '0 days'
        }
      })
      
      // Mock user B3TR data
      setUserB3TRRewards('0')
    } catch (error) {
      console.error('Error loading B3TR data:', error)
    }
  }

  const loadSecurityStatus = async () => {
    try {
      // Mock security status - in real implementation, fetch from contract
      setSecurityStatus({
        maxBeneficiaries: 5,
        minimumDeposit: '0.1',
        isPaused: false,
        totalUsers: 1250,
        totalValueLocked: '45,250'
      })
    } catch (error) {
      console.error('Error loading security status:', error)
    }
  }

  const loadOBOLData = async () => {
    try {
      // Enhanced OBOL tokenomics data with more realistic rates
      setObolTokenomics({
        totalSupply: '100,000,000',
        initialSupply: '5,000,000',
        rewardSupply: '95,000,000',
        rewardRate: '1 OBOL per 1 VET deposited',
        remainingRewards: '85,000,000',
        vestingProgress: 10.5,
        dailyAPY: 8.5,
        bonusAPY: 2.1,
        userStake: {
          lockedValue: '0',
          lastClaimTime: 0,
          startTime: 0,
          totalEarned: '0',
          pendingRewards: '0',
          dailyRewardRate: '0',
          isLongTermHolder: false
        }
      })
      
      // Mock user OBOL data
      setUserObolBalance('0')
      setUserObolRewards('0')
    } catch (error) {
      console.error('Error loading OBOL data:', error)
    }
  }

  const handleVerifyUser = async () => {
    if (!userAge || !verificationHash) {
      showNotification('Please fill in all required fields', 'error')
      return
    }
    if (!account) {
      showNotification('Please connect your wallet before verifying.', 'error')
      return
    }
    setLoading('verifyUser', true)
    try {
      const tx = await verifyUser(account, parseInt(userAge), verificationHash)
      await tx.wait()
      showNotification('User verified successfully!', 'success')
      await refreshUserData()
    } catch (error) {
      console.error('Error verifying user:', error)
      showNotification('Failed to verify user', 'error')
    }
    setLoading('verifyUser', false)
  }

  const handleCreateSarcophagus = async (beneficiaries: string[], percentages: number[]) => {
    if (beneficiaries.length === 0) {
      showNotification('Please add at least one beneficiary', 'error')
      return
    }

    const totalPercentage = percentages.reduce((sum, p) => sum + p, 0)
    if (Math.abs(totalPercentage - 100) > 0.01) {
      showNotification('Beneficiary percentages must total 100%', 'error')
      return
    }

    setLoading('createSarcophagus', true)
    try {
      const tx = await createSarcophagus(beneficiaries, percentages)
      await tx.wait()
      showNotification('Sarcophagus created successfully!', 'success')
      await refreshUserData()
      setBeneficiaryModalOpen(false)
    } catch (error) {
      console.error('Error creating sarcophagus:', error)
      showNotification('Failed to create sarcophagus', 'error')
    }
    setLoading('createSarcophagus', false)
  }

  const handleDepositTokens = async () => {
    if (!vetAmount && !vthoAmount && !b3trAmount) {
      showNotification('Please enter at least one token amount', 'error')
      return
    }

    setLoading('depositTokens', true)
    try {
      const tx = await depositTokens(
        vthoAmount || '0',
        b3trAmount || '0'
      )
      await tx.wait()
      showNotification('Tokens deposited successfully!', 'success')
      await refreshUserData()
      
      // Clear form
      setVetAmount('')
      setVthoAmount('')
      setB3trAmount('')
    } catch (error) {
      console.error('Error depositing tokens:', error)
      showNotification('Failed to deposit tokens', 'error')
    }
    setLoading('depositTokens', false)
  }

  const handleLockObolTokens = async () => {
    if (!obolAmount) {
      showNotification('Please enter OBOL amount', 'error')
      return
    }

    setLoading('lockObolTokens', true)
    try {
      const tx = await lockObolTokens(obolAmount)
      await tx.wait()
      showNotification('OBOL tokens locked successfully!', 'success')
      await refreshUserData()
      setObolAmount('')
    } catch (error) {
      console.error('Error locking OBOL tokens:', error)
      showNotification('Failed to lock OBOL tokens', 'error')
    }
    setLoading('lockObolTokens', false)
  }

  const handleClaimB3TRRewards = async () => {
    setLoading('claimB3TRRewards', true)
    try {
      // Mock B3TR claim - implement actual contract call
      showNotification('B3TR rewards claimed successfully!', 'success')
    } catch (error) {
      console.error('Error claiming B3TR rewards:', error)
      showNotification('Failed to claim B3TR rewards', 'error')
    }
    setLoading('claimB3TRRewards', false)
  }

  const handleVerifyDeath = async () => {
    if (!deceasedAddress || !deathAge || !deathProofHash) {
      showNotification('Please fill in all required fields', 'error')
      return
    }

    setLoading('verifyDeath', true)
    try {
      const tx = await verifyDeath(deceasedAddress, parseInt(deathAge), deathProofHash)
      await tx.wait()
      showNotification('Death verified successfully!', 'success')
      
      // Clear form
      setDeceasedAddress('')
      setDeathAge('')
      setDeathProofHash('')
    } catch (error) {
      console.error('Error verifying death:', error)
      showNotification('Failed to verify death', 'error')
    }
    setLoading('verifyDeath', false)
  }

  const handleClaimInheritance = async () => {
    if (!deceasedAddress) {
      showNotification('Please enter the deceased user\'s address', 'error')
      return
    }
    if (!account) {
      showNotification('Please connect your wallet to claim.', 'error')
      return
    }

    setLoading('claimInheritance', true)
    try {
      const tx = await claimInheritance(deceasedAddress)
      await tx.wait()
      showNotification('Inheritance claimed successfully!', 'success')
      setDeceasedAddress('')
    } catch (error) {
      console.error('Error claiming inheritance:', error)
      showNotification('Failed to claim inheritance', 'error')
    }
    setLoading('claimInheritance', false)
  }

  const handleManageVault = (vault: VaultData) => {
    setSelectedVault(vault)
    setShowVaultManagement(true)
  }

  const handleOnboardingComplete = async (data: any) => {
    setLoading('createSarcophagus', true);

    try {
      const beneficiaries = data.beneficiaries.map((b: any) => b.address);
      const percentages = data.beneficiaries.map((b: any) => parseInt(b.percentage, 10));

      const tx = await createSarcophagus(beneficiaries, percentages);
      await tx.wait();

      showNotification('Sarcophagus vault created successfully!', 'success');
      await refreshUserData();
      
      // Only close onboarding after successful vault creation
      setIsOnboardingOpen(false);
    } catch (error) {
      console.error('Error creating sarcophagus from onboarding:', error);
      showNotification('Failed to create Sarcophagus vault.', 'error');
      // Don't close onboarding on error - let user try again
    }

    setLoading('createSarcophagus', false);
  };

  const handleBeneficiaryModalComplete = async (beneficiaries: any[], charityAddress?: string) => {
    setLoading('createSarcophagus', true);

    try {
      const addresses = beneficiaries.map((b: any) => b.address);
      const percentages = beneficiaries.map((b: any) => b.percentage);

      const tx = await createSarcophagus(addresses, percentages);
      await tx.wait();

      showNotification('Sarcophagus vault created successfully!', 'success');
      await refreshUserData();
      
      // Close the beneficiary modal
      setBeneficiaryModalOpen(false);
    } catch (error) {
      console.error('Error creating sarcophagus from beneficiary modal:', error);
      showNotification('Failed to create Sarcophagus vault.', 'error');
    }

    setLoading('createSarcophagus', false);
  };

  const handleClaimObolRewards = async () => {
    setLoading('claimObolRewards', true);
    try {
      const tx = await claimObolRewards();
      await tx.wait();
      showNotification('OBOL rewards claimed successfully!', 'success');
      await loadOBOLData();
    } catch (error) {
      console.error('Error claiming OBOL rewards:', error);
      showNotification('Failed to claim OBOL rewards', 'error');
    }
    setLoading('claimObolRewards', false);
  };

  // Show legal disclosure if user hasn't accepted terms
  if (showLegalDisclosure && account) {
    return (
      <LegalDisclosure
        onAccept={acceptAllTerms}
        onDecline={declineTerms}
        userAddress={account}
      />
    )
  }

  // Show main content only if user has accepted terms or is not connected
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="container mx-auto p-4">
        {account && hasAcceptedAllTerms ? (
          <Dashboard />
        ) : (
          <UserJourney />
        )}
      </main>

      {/* Modals are managed here, outside of the main content flow */}
      <OnboardingFlow
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleOnboardingComplete}
      />
      <BeneficiaryModal
        isOpen={isBeneficiaryModalOpen}
        onClose={() => setBeneficiaryModalOpen(false)}
        onComplete={handleBeneficiaryModalComplete}
      />
      <VaultManagementModal
        vault={selectedVault}
        isOpen={showVaultManagement}
        onClose={() => setShowVaultManagement(false)}
        defaultTab={vaultModalTab}
      />
    </div>
  )
} 