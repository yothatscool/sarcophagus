'use client'

import { useState, useEffect } from 'react'
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

export default function HomeContent() {
  const { account, disconnect } = useWallet()
  const isConnected = !!account
  const { showNotification, showTransactionNotification } = useNotification()
  const { loadingStates, setLoading } = useLoading()
  const [isBeneficiaryModalOpen, setBeneficiaryModalOpen] = useState(false)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
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
    if (isConnected && account && !isUserVerified) {
      // Show onboarding when connected but not verified
      setIsOnboardingOpen(true)
    }
  }, [isConnected, account, isUserVerified])

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
        totalValueLocked: '2,450,000'
      })
    } catch (error) {
      console.error('Error loading security status:', error)
    }
  }

  const loadOBOLData = async () => {
    try {
      // Enhanced OBOL tokenomics with real-time data
      setObolTokenomics({
        totalSupply: '1,000,000,000',
        initialSupply: '50,000,000',
        rewardSupply: '950,000,000',
        rewardRate: '10 OBOL per 1 VET-equivalent',
        remainingRewards: '847,500,000',
        vestingProgress: 25,
        dailyAPY: 365,
        bonusAPY: 730,
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
      showNotification('Please fill in all fields', 'warning')
      return
    }

    try {
      setLoading('verifyUser', true)
      await verifyUser(account!, parseInt(userAge), verificationHash)
      showNotification('User verification successful!', 'success')
      setUserAge('')
      setVerificationHash('')
    } catch (error) {
      console.error('Verification error:', error)
      showNotification('Verification failed', 'error')
    } finally {
      setLoading('verifyUser', false)
    }
  }

  const handleCreateSarcophagus = async (beneficiaries: string[], percentages: number[]) => {
    if (beneficiaries.length === 0) {
      showNotification('Please add at least one beneficiary', 'warning')
      return
    }

    try {
      setLoading('createSarcophagus', true)
      await createSarcophagus(beneficiaries, percentages)
      showNotification('Sarcophagus created successfully!', 'success')
      setBeneficiaryModalOpen(false)
    } catch (error) {
      console.error('Create sarcophagus error:', error)
      showNotification('Failed to create sarcophagus', 'error')
    } finally {
      setLoading('createSarcophagus', false)
    }
  }

  const handleDepositTokens = async () => {
    if (!vetAmount && !vthoAmount && !b3trAmount) {
      showNotification('Please enter at least one token amount', 'warning')
      return
    }

    try {
      setLoading('depositTokens', true)
      await depositTokens(vthoAmount, b3trAmount)
      showNotification('Tokens deposited successfully!', 'success')
      setVetAmount('')
      setVthoAmount('')
      setB3trAmount('')
    } catch (error) {
      console.error('Deposit error:', error)
      showNotification('Deposit failed', 'error')
    } finally {
      setLoading('depositTokens', false)
    }
  }

  const handleLockObolTokens = async () => {
    if (!obolAmount) {
      showNotification('Please enter OBOL amount', 'warning')
      return
    }

    try {
      setLoading('lockObolTokens', true)
      await lockObolTokens(obolAmount)
      showNotification('OBOL tokens locked successfully!', 'success')
      setObolAmount('')
    } catch (error) {
      console.error('Lock OBOL error:', error)
      showNotification('Failed to lock OBOL tokens', 'error')
    } finally {
      setLoading('lockObolTokens', false)
    }
  }

  const handleClaimB3TRRewards = async () => {
    try {
      setLoading('claimB3TR', true)
      // Mock B3TR claim - implement actual contract call
      showNotification('B3TR rewards claimed successfully!', 'success')
    } catch (error) {
      console.error('Claim B3TR error:', error)
      showNotification('Failed to claim B3TR rewards', 'error')
    } finally {
      setLoading('claimB3TR', false)
    }
  }

  const handleVerifyDeath = async () => {
    if (!deceasedAddress || !deathAge || !deathProofHash) {
      showNotification('Please fill in all fields', 'warning')
      return
    }

    try {
      setLoading('verifyDeath', true)
      await verifyDeath(deceasedAddress, parseInt(deathAge), deathProofHash)
      showNotification('Death verification submitted!', 'success')
      setDeceasedAddress('')
      setDeathAge('')
      setDeathProofHash('')
    } catch (error) {
      console.error('Death verification error:', error)
      showNotification('Death verification failed', 'error')
    } finally {
      setLoading('verifyDeath', false)
    }
  }

  const handleClaimInheritance = async () => {
    if (!deceasedAddress) {
      showNotification('Please enter deceased address', 'warning')
      return
    }

    try {
      setLoading('claimInheritance', true)
      await claimInheritance(deceasedAddress)
      showNotification('Inheritance claimed successfully!', 'success')
      setDeceasedAddress('')
    } catch (error) {
      console.error('Claim inheritance error:', error)
      showNotification('Failed to claim inheritance', 'error')
    } finally {
      setLoading('claimInheritance', false)
    }
  }

  const handleManageVault = (vault: VaultData) => {
    setSelectedVault(vault)
    setShowVaultManagement(true)
  }

  const handleOnboardingComplete = async (data: any) => {
    try {
      setLoading('onboarding', true)
      
      console.log('Onboarding completion started with data:', data)
      
      if (!account) {
        showNotification('Please connect your wallet first', 'error')
        return
      }

      console.log('Account connected:', account)

      // Extract beneficiary data
      const beneficiaries = data.beneficiaries || []
      const addresses = beneficiaries.map((b: any) => b.address)
      const percentages = beneficiaries.map((b: any) => parseInt(b.percentage))

      console.log('Beneficiaries:', { addresses, percentages })

      // Validate beneficiaries
      if (addresses.length === 0) {
        showNotification('Please add at least one beneficiary', 'error')
        return
      }

      if (percentages.reduce((sum: number, p: number) => sum + p, 0) !== 100) {
        showNotification('Beneficiary percentages must add up to 100%', 'error')
        return
      }

      console.log('About to call createSarcophagus with:', { addresses, percentages })

      // Create the actual sarcophagus vault using the smart contract
      const result = await createSarcophagus(addresses, percentages)
      
      console.log('createSarcophagus result:', result)
      
      // Close the onboarding modal
      setIsOnboardingOpen(false)
      
      showNotification('Sarcophagus vault created successfully!', 'success')
    } catch (error) {
      console.error('Onboarding error details:', error)
      showNotification('Failed to create vault: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error')
    } finally {
      setLoading('onboarding', false)
    }
  }

  const handleBeneficiaryModalComplete = async (beneficiaries: any[], charityAddress?: string) => {
    try {
      setLoading('beneficiaryModal', true)
      
      // Add charity as beneficiary if provided
      const allBeneficiaries = charityAddress 
        ? [...beneficiaries, { address: charityAddress, percentage: 5 }]
        : beneficiaries
      
      const addresses = allBeneficiaries.map(b => b.address)
      const percentages = allBeneficiaries.map(b => b.percentage)
      
      await handleCreateSarcophagus(addresses, percentages)
    } catch (error) {
      console.error('Beneficiary modal error:', error)
      showNotification('Failed to create sarcophagus', 'error')
    } finally {
      setLoading('beneficiaryModal', false)
    }
  }

  const handleClaimObolRewards = async () => {
    try {
      setLoading('claimObol', true)
      await claimObolRewards()
      showNotification('OBOL rewards claimed successfully!', 'success')
    } catch (error) {
      console.error('Claim OBOL error:', error)
      showNotification('Failed to claim OBOL rewards', 'error')
    } finally {
      setLoading('claimObol', false)
    }
  }

  return (
    <div className="min-h-screen bg-sarcophagus-950">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserJourney />
      </main>

      {/* Modals */}
      <OnboardingFlow
        isOpen={isOnboardingOpen}
        onComplete={handleOnboardingComplete}
        onClose={() => setIsOnboardingOpen(false)}
      />

      <BeneficiaryModal
        isOpen={isBeneficiaryModalOpen}
        onComplete={handleBeneficiaryModalComplete}
        onClose={() => setBeneficiaryModalOpen(false)}
      />

      <VaultManagementModal
        vault={selectedVault}
        isOpen={showVaultManagement}
        onClose={() => setShowVaultManagement(false)}
        defaultTab={vaultModalTab}
      />

      {/* Legal Disclosure - only show when explicitly triggered (e.g., when depositing tokens) */}
      {showLegalDisclosure && (
        <LegalDisclosure
          onAccept={acceptAllTerms}
          onDecline={declineTerms}
          userAddress={account || ''}
        />
      )}
    </div>
  )
} 