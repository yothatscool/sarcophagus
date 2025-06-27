'use client'

import { useState, useEffect, useRef } from 'react'
import { useSarcophagusContract } from '../hooks/useSarcophagusContract'
import { useNotification } from '../contexts/NotificationContext'
import { useLoading } from '../contexts/LoadingContext'
import React from 'react'
import { ethers } from 'ethers'
import { FaSyncAlt, FaInfoCircle, FaExternalLinkAlt, FaShieldAlt } from 'react-icons/fa'
import LegalAgreement from './LegalAgreement'

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
}

interface VaultManagementModalProps {
  vault: VaultData | null;
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'deposit' | 'obol' | 'b3tr' | 'beneficiaries' | 'info' | 'nfts' | 'convert';
}

interface InputValidation {
  isValid: boolean;
  error?: string;
  success?: string;
}

export default function VaultManagementModalEnhanced({ vault, isOpen, onClose, defaultTab }: VaultManagementModalProps) {
  const { showNotification } = useNotification()
  const { isLoading } = useLoading()
  
  // Accessibility refs
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const firstTabRef = useRef<HTMLButtonElement>(null)
  
  // State variables
  const [vetAmount, setVetAmount] = useState('')
  const [vthoAmount, setVthoAmount] = useState('')
  const [b3trAmount, setB3trAmount] = useState('')
  const [obolAmount, setObolAmount] = useState('')
  const [gloAmount, setGloAmount] = useState('')
  const [convertFromToken, setConvertFromToken] = useState('')
  const [convertToToken, setConvertToToken] = useState('')
  const [convertFromAmount, setConvertFromAmount] = useState('')
  const [convertMinToAmount, setConvertMinToAmount] = useState('')
  const [activeTab, setActiveTab] = useState<'deposit' | 'obol' | 'b3tr' | 'beneficiaries' | 'info' | 'nfts' | 'convert'>(defaultTab || 'deposit')

  // Legal agreement state
  const [showLegalAgreement, setShowLegalAgreement] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    type: 'deposit' | 'lock' | 'convert'
    action: () => Promise<void>
  } | null>(null)

  // Input validation state
  const [inputValidation, setInputValidation] = useState<{[key: string]: InputValidation}>({})

  // NFT-related state
  const [nftSearchTerm, setNftSearchTerm] = useState('')
  const [selectedCollection, setSelectedCollection] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [nftValues, setNftValues] = useState<{[key: string]: string}>({})
  const [nftBeneficiaries, setNftBeneficiaries] = useState<{[key: string]: string}>({})
  const [selectedNFTs, setSelectedNFTs] = useState<Set<string>>(new Set())

  const {
    depositTokens,
    addGLO,
    lockObolTokens,
    convertTokens,
    getConversionRate,
    supportedTokens,
    conversionLoading,
    refreshUserData,
    userSarcophagus,
    // NFT-related functions
    nftCollections,
    userNFTs,
    lockedNFTs,
    nftLoading,
    loadNFTCollections,
    loadUserNFTs,
    loadLockedNFTs,
    lockNFT,
    unlockNFT,
    updateNFTBeneficiary,
    loading
  } = useSarcophagusContract()

  const [conversionRate, setConversionRate] = useState<string>('')
  const [convertError, setConvertError] = useState<string | null>(null)
  const [convertSuccess, setConvertSuccess] = useState<string | null>(null)

  // Show token balances at the top
  const tokenBalances = userSarcophagus ? [
    { label: 'VET', value: userSarcophagus.vetAmount, symbol: 'VET' },
    { label: 'VTHO', value: userSarcophagus.vthoAmount, symbol: 'VTHO' },
    { label: 'B3TR', value: userSarcophagus.b3trAmount, symbol: 'B3TR' },
    { label: 'OBOL', value: userSarcophagus.obolAmount, symbol: 'OBOL' },
    { label: 'GLO', value: userSarcophagus.gloAmount, symbol: 'GLO' },
  ] : [];

  // Focus management and accessibility
  useEffect(() => {
    if (isOpen) {
      // Focus the modal when it opens
      modalRef.current?.focus()
      
      // Trap focus within modal
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
        if (e.key === 'Tab') {
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          if (focusableElements) {
            const firstElement = focusableElements[0] as HTMLElement
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
            
            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                e.preventDefault()
                lastElement.focus()
              }
            } else {
              if (document.activeElement === lastElement) {
                e.preventDefault()
                firstElement.focus()
              }
            }
          }
        }
      }
      
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Update activeTab when defaultTab changes (modal opens)
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab)
    }
  }, [defaultTab])

  // Load NFT data when NFT tab is active
  useEffect(() => {
    if (activeTab === 'nfts') {
      loadNFTCollections()
      loadUserNFTs()
      loadLockedNFTs()
    }
  }, [activeTab, loadNFTCollections, loadUserNFTs, loadLockedNFTs])

  // Real-time conversion rate fetch
  useEffect(() => {
    const fetchRate = async () => {
      if (convertFromToken && convertToToken && convertFromAmount && getConversionRate) {
        try {
          const rate = await getConversionRate(convertFromToken, convertToToken, convertFromAmount)
          setConversionRate(rate.toString())
        } catch {
          setConversionRate('')
        }
      } else {
        setConversionRate('')
      }
    }
    fetchRate()
  }, [convertFromToken, convertToToken, convertFromAmount, getConversionRate])

  // Input validation functions
  const validateAmount = (amount: string, maxAmount: string, tokenName: string): InputValidation => {
    if (!amount || parseFloat(amount) <= 0) {
      return { isValid: false, error: `Please enter a valid ${tokenName} amount` }
    }
    if (parseFloat(amount) > parseFloat(ethers.formatEther(maxAmount))) {
      return { isValid: false, error: `Insufficient ${tokenName} balance` }
    }
    return { isValid: true, success: `Valid ${tokenName} amount` }
  }

  const handleAmountChange = (amount: string, setter: (value: string) => void, maxAmount: string, tokenName: string, fieldName: string) => {
    setter(amount)
    if (amount) {
      const validation = validateAmount(amount, maxAmount, tokenName)
      setInputValidation(prev => ({ ...prev, [fieldName]: validation }))
    } else {
      setInputValidation(prev => ({ ...prev, [fieldName]: { isValid: true } }))
    }
  }

  const setMaxAmount = (maxAmount: string, setter: (value: string) => void, fieldName: string) => {
    const formattedAmount = ethers.formatEther(maxAmount)
    setter(formattedAmount)
    setInputValidation(prev => ({ ...prev, [fieldName]: { isValid: true, success: 'Maximum amount set' } }))
  }

  // Legal agreement handlers
  const handleLegalAgreementAccept = async () => {
    setShowLegalAgreement(false)
    if (pendingAction) {
      await pendingAction.action()
      setPendingAction(null)
    }
  }

  const handleLegalAgreementDecline = () => {
    setShowLegalAgreement(false)
    setPendingAction(null)
  }

  const showLegalAgreementForAction = (type: 'deposit' | 'lock' | 'convert', action: () => Promise<void>) => {
    setPendingAction({ type, action })
    setShowLegalAgreement(true)
  }

  // Enhanced handlers with validation
  const handleDepositTokens = async () => {
    const hasValidInput = (vetAmount && inputValidation.vetAmount?.isValid) ||
                         (vthoAmount && inputValidation.vthoAmount?.isValid) ||
                         (b3trAmount && inputValidation.b3trAmount?.isValid)

    if (!hasValidInput) {
      showNotification('Please enter valid token amounts', 'warning')
      return
    }

    showLegalAgreementForAction('deposit', async () => {
      try {
        const tx = await depositTokens(vthoAmount || '0', b3trAmount || '0')
        showNotification('Depositing tokens...', 'info')
        await tx.wait()
        showNotification('Tokens deposited successfully!', 'success')
        await refreshUserData()
        setVetAmount('')
        setVthoAmount('')
        setB3trAmount('')
        setInputValidation({})
      } catch (error) {
        console.error('Error depositing tokens:', error)
        showNotification('Failed to deposit tokens', 'error')
      }
    })
  }

  const handleDepositGLO = async () => {
    if (!gloAmount || !inputValidation.gloAmount?.isValid) {
      showNotification('Please enter a valid GLO amount', 'warning')
      return
    }
    
    showLegalAgreementForAction('deposit', async () => {
      try {
        const tx = await addGLO(gloAmount)
        showNotification('Depositing GLO...', 'info')
        await tx.wait()
        showNotification('GLO deposited successfully!', 'success')
        await refreshUserData()
        setGloAmount('')
        setInputValidation(prev => ({ ...prev, gloAmount: { isValid: true } }))
      } catch (error) {
        console.error('Error depositing GLO:', error)
        showNotification('Failed to deposit GLO', 'error')
      }
    })
  }

  const handleLockObolTokens = async () => {
    if (!obolAmount || !inputValidation.obolAmount?.isValid) {
      showNotification('Please enter a valid OBOL amount', 'warning')
      return
    }

    showLegalAgreementForAction('lock', async () => {
      try {
        const tx = await lockObolTokens(obolAmount)
        showNotification('Locking OBOL tokens...', 'info')
        await tx.wait()
        showNotification('OBOL tokens locked successfully!', 'success')
        await refreshUserData()
        setObolAmount('')
        setInputValidation(prev => ({ ...prev, obolAmount: { isValid: true } }))
      } catch (error) {
        console.error('Error locking OBOL tokens:', error)
        showNotification('Failed to lock OBOL tokens', 'error')
      }
    })
  }

  // NFT batch operations
  const handleSelectAllNFTs = () => {
    const allNFTKeys = userNFTs?.map(nft => `${nft.contractAddress}-${nft.tokenId}`) || []
    setSelectedNFTs(new Set(allNFTKeys))
  }

  const handleDeselectAllNFTs = () => {
    setSelectedNFTs(new Set())
  }

  const handleToggleNFT = (nftKey: string) => {
    const newSelected = new Set(selectedNFTs)
    if (newSelected.has(nftKey)) {
      newSelected.delete(nftKey)
    } else {
      newSelected.add(nftKey)
    }
    setSelectedNFTs(newSelected)
  }

  const handleBatchLockNFTs = async () => {
    const selectedNFTsArray = Array.from(selectedNFTs)
    const nftsToLock = userNFTs?.filter(nft => {
      const nftKey = `${nft.contractAddress}-${nft.tokenId}`
      const beneficiary = nftBeneficiaries[nftKey]
      const value = nftValues[nftKey]
      return selectedNFTsArray.includes(nftKey) && beneficiary && value && parseFloat(value) > 0 && !nft.isLocked
    }) || []

    if (nftsToLock.length === 0) {
      showNotification('Please select NFTs to lock with beneficiaries and values', 'warning')
      return
    }

    showLegalAgreementForAction('lock', async () => {
      try {
        for (const nft of nftsToLock) {
          const nftKey = `${nft.contractAddress}-${nft.tokenId}`
          const beneficiary = nftBeneficiaries[nftKey]
          const value = nftValues[nftKey]
          await lockNFT(nft.contractAddress, nft.tokenId, ethers.parseEther(value), beneficiary)
        }
        showNotification(`Successfully locked ${nftsToLock.length} NFTs!`, 'success')
        setSelectedNFTs(new Set())
      } catch (error) {
        console.error('Error in batch lock:', error)
        showNotification('Some NFTs failed to lock', 'error')
      }
    })
  }

  // Swap from/to tokens
  const handleSwapTokens = () => {
    setConvertFromToken(convertToToken)
    setConvertToToken(convertFromToken)
    setConvertFromAmount('')
    setConvertMinToAmount('')
    setConversionRate('')
    setConvertError(null)
    setConvertSuccess(null)
  }

  const handleConvertTokens = async () => {
    setConvertError(null)
    setConvertSuccess(null)
    if (!convertFromToken || !convertToToken || !convertFromAmount) {
      setConvertError('Please select tokens and enter an amount')
      showNotification('Please select tokens and enter an amount', 'warning')
      return
    }
    
    showLegalAgreementForAction('convert', async () => {
      try {
        const tx = await convertTokens(convertFromToken, convertToToken, convertFromAmount)
        showNotification('Converting tokens...', 'info')
        await tx.wait()
        showNotification('Tokens converted successfully!', 'success')
        setConvertSuccess('Tokens converted successfully!')
        await refreshUserData()
        setConvertFromAmount('')
        setConvertMinToAmount('')
      } catch (error) {
        console.error('Error converting tokens:', error)
        setConvertError('Failed to convert tokens')
        showNotification('Failed to convert tokens', 'error')
      }
    })
  }

  if (!isOpen || !vault) return null

  return (
    <div 
      className="fixed inset-0 bg-sarcophagus-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div 
        ref={modalRef}
        className="bg-sarcophagus-900 border border-sarcophagus-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        tabIndex={-1}
      >
        {/* Header with Trust Signals */}
        <div className="p-6 border-b border-sarcophagus-700">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 id="modal-title" className="text-xl font-bold text-sarcophagus-100">
                Manage Vault #{vault.id}
              </h2>
              <p id="modal-description" className="text-sarcophagus-400 mt-1">
                Manage your vault tokens, NFTs, and beneficiaries
              </p>
              
              {/* Trust Signals */}
              <div className="flex items-center gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1 text-green-400">
                  <FaShieldAlt />
                  <span>Audited Smart Contracts</span>
                </div>
                <a 
                  href="https://explore.vechain.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sarcophagus-400 hover:text-accent-gold transition-colors"
                >
                  <FaExternalLinkAlt />
                  <span>View on Explorer</span>
                </a>
                <div className="flex items-center gap-1 text-sarcophagus-400">
                  <span>Network: VeChain</span>
                </div>
              </div>
            </div>
            
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="text-sarcophagus-400 hover:text-sarcophagus-200 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-gold rounded p-1"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div 
          className="flex border-b border-sarcophagus-700 overflow-x-auto"
          role="tablist"
          aria-label="Vault management tabs"
        >
          <button
            ref={firstTabRef}
            onClick={() => setActiveTab('deposit')}
            className={`px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-gold rounded-t whitespace-nowrap ${
              activeTab === 'deposit'
                ? 'text-accent-gold border-b-2 border-accent-gold'
                : 'text-sarcophagus-400 hover:text-sarcophagus-200'
            }`}
            role="tab"
            aria-selected={activeTab === 'deposit'}
            aria-controls="deposit-panel"
          >
            Deposit Tokens
          </button>
          <button
            onClick={() => setActiveTab('obol')}
            className={`px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-gold rounded-t whitespace-nowrap ${
              activeTab === 'obol'
                ? 'text-accent-gold border-b-2 border-accent-gold'
                : 'text-sarcophagus-400 hover:text-sarcophagus-200'
            }`}
            role="tab"
            aria-selected={activeTab === 'obol'}
            aria-controls="obol-panel"
          >
            OBOL Rewards
          </button>
          <button
            onClick={() => setActiveTab('b3tr')}
            className={`px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-gold rounded-t whitespace-nowrap ${
              activeTab === 'b3tr'
                ? 'text-accent-gold border-b-2 border-accent-gold'
                : 'text-sarcophagus-400 hover:text-sarcophagus-200'
            }`}
            role="tab"
            aria-selected={activeTab === 'b3tr'}
            aria-controls="b3tr-panel"
          >
            B3TR Rewards
          </button>
          <button
            onClick={() => setActiveTab('beneficiaries')}
            className={`px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-gold rounded-t whitespace-nowrap ${
              activeTab === 'beneficiaries'
                ? 'text-accent-gold border-b-2 border-accent-gold'
                : 'text-sarcophagus-400 hover:text-sarcophagus-200'
            }`}
            role="tab"
            aria-selected={activeTab === 'beneficiaries'}
            aria-controls="beneficiaries-panel"
          >
            Beneficiaries
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-gold rounded-t whitespace-nowrap ${
              activeTab === 'info'
                ? 'text-accent-gold border-b-2 border-accent-gold'
                : 'text-sarcophagus-400 hover:text-sarcophagus-200'
            }`}
            role="tab"
            aria-selected={activeTab === 'info'}
            aria-controls="info-panel"
          >
            Vault Info
          </button>
          <button
            onClick={() => setActiveTab('nfts')}
            className={`px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-gold rounded-t whitespace-nowrap ${
              activeTab === 'nfts'
                ? 'text-accent-gold border-b-2 border-accent-gold'
                : 'text-sarcophagus-400 hover:text-sarcophagus-200'
            }`}
            role="tab"
            aria-selected={activeTab === 'nfts'}
            aria-controls="nfts-panel"
          >
            NFTs
          </button>
          <button
            onClick={() => setActiveTab('convert')}
            className={`px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-gold rounded-t whitespace-nowrap ${
              activeTab === 'convert'
                ? 'text-accent-gold border-b-2 border-accent-gold'
                : 'text-sarcophagus-400 hover:text-sarcophagus-200'
            }`}
            role="tab"
            aria-selected={activeTab === 'convert'}
            aria-controls="convert-panel"
          >
            Convert
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Token Balances */}
          {tokenBalances.length > 0 && (
            <div className="mb-6 p-4 bg-sarcophagus-800/30 border border-sarcophagus-700 rounded-lg">
              <h3 className="text-sm font-semibold text-sarcophagus-200 mb-3">Vault Balances</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {tokenBalances.map((balance) => (
                  <div key={balance.label} className="text-center">
                    <div className="text-sarcophagus-400 text-xs">{balance.label}</div>
                    <div className="text-sarcophagus-100 font-medium">
                      {ethers.formatEther(balance.value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Panels */}
          {activeTab === 'deposit' && (
            <div id="deposit-panel" role="tabpanel" aria-labelledby="deposit-tab" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-sarcophagus-100 mb-4">Deposit Tokens</h3>
                <p className="text-sarcophagus-400 mb-4">
                  Deposit VET, VTHO, B3TR, or GLO tokens into your vault to start earning OBOL rewards.
                </p>
                
                {/* VET Deposit */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-sarcophagus-300 mb-2">
                      VET Amount
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={vetAmount}
                        onChange={(e) => handleAmountChange(e.target.value, setVetAmount, (userSarcophagus?.vetAmount || 0n).toString(), 'VET', 'vetAmount')}
                        className={`flex-1 bg-sarcophagus-800 border rounded-lg px-4 py-2 text-sarcophagus-100 placeholder-sarcophagus-500 focus:outline-none focus:ring-2 focus:ring-accent-gold ${
                          inputValidation.vetAmount?.error ? 'border-red-500' : 
                          inputValidation.vetAmount?.success ? 'border-green-500' : 'border-sarcophagus-600'
                        }`}
                        placeholder="0.0"
                        step="0.01"
                        min="0"
                      />
                      <button
                        onClick={() => setMaxAmount((userSarcophagus?.vetAmount || 0n).toString(), setVetAmount, 'vetAmount')}
                        className="bg-sarcophagus-700 hover:bg-sarcophagus-600 text-sarcophagus-200 px-3 py-2 rounded-lg text-sm transition-colors"
                      >
                        Max
                      </button>
                    </div>
                    {inputValidation.vetAmount?.error && (
                      <p className="text-red-400 text-sm mt-1">{inputValidation.vetAmount.error}</p>
                    )}
                    {inputValidation.vetAmount?.success && (
                      <p className="text-green-400 text-sm mt-1">{inputValidation.vetAmount.success}</p>
                    )}
                  </div>

                  {/* VTHO Deposit */}
                  <div>
                    <label className="block text-sm font-medium text-sarcophagus-300 mb-2">
                      VTHO Amount
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={vthoAmount}
                        onChange={(e) => handleAmountChange(e.target.value, setVthoAmount, (userSarcophagus?.vthoAmount || 0n).toString(), 'VTHO', 'vthoAmount')}
                        className={`flex-1 bg-sarcophagus-800 border rounded-lg px-4 py-2 text-sarcophagus-100 placeholder-sarcophagus-500 focus:outline-none focus:ring-2 focus:ring-accent-gold ${
                          inputValidation.vthoAmount?.error ? 'border-red-500' : 
                          inputValidation.vthoAmount?.success ? 'border-green-500' : 'border-sarcophagus-600'
                        }`}
                        placeholder="0.0"
                        step="0.01"
                        min="0"
                      />
                      <button
                        onClick={() => setMaxAmount((userSarcophagus?.vthoAmount || 0n).toString(), setVthoAmount, 'vthoAmount')}
                        className="bg-sarcophagus-700 hover:bg-sarcophagus-600 text-sarcophagus-200 px-3 py-2 rounded-lg text-sm transition-colors"
                      >
                        Max
                      </button>
                    </div>
                    {inputValidation.vthoAmount?.error && (
                      <p className="text-red-400 text-sm mt-1">{inputValidation.vthoAmount.error}</p>
                    )}
                    {inputValidation.vthoAmount?.success && (
                      <p className="text-green-400 text-sm mt-1">{inputValidation.vthoAmount.success}</p>
                    )}
                  </div>

                  {/* B3TR Deposit */}
                  <div>
                    <label className="block text-sm font-medium text-sarcophagus-300 mb-2">
                      B3TR Amount
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={b3trAmount}
                        onChange={(e) => handleAmountChange(e.target.value, setB3trAmount, (userSarcophagus?.b3trAmount || 0n).toString(), 'B3TR', 'b3trAmount')}
                        className={`flex-1 bg-sarcophagus-800 border rounded-lg px-4 py-2 text-sarcophagus-100 placeholder-sarcophagus-500 focus:outline-none focus:ring-2 focus:ring-accent-gold ${
                          inputValidation.b3trAmount?.error ? 'border-red-500' : 
                          inputValidation.b3trAmount?.success ? 'border-green-500' : 'border-sarcophagus-600'
                        }`}
                        placeholder="0.0"
                        step="0.01"
                        min="0"
                      />
                      <button
                        onClick={() => setMaxAmount((userSarcophagus?.b3trAmount || 0n).toString(), setB3trAmount, 'b3trAmount')}
                        className="bg-sarcophagus-700 hover:bg-sarcophagus-600 text-sarcophagus-200 px-3 py-2 rounded-lg text-sm transition-colors"
                      >
                        Max
                      </button>
                    </div>
                    {inputValidation.b3trAmount?.error && (
                      <p className="text-red-400 text-sm mt-1">{inputValidation.b3trAmount.error}</p>
                    )}
                    {inputValidation.b3trAmount?.success && (
                      <p className="text-green-400 text-sm mt-1">{inputValidation.b3trAmount.success}</p>
                    )}
                  </div>

                  {/* GLO Deposit */}
                  <div>
                    <label className="block text-sm font-medium text-sarcophagus-300 mb-2">
                      GLO Amount
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={gloAmount}
                        onChange={(e) => handleAmountChange(e.target.value, setGloAmount, (userSarcophagus?.gloAmount || 0n).toString(), 'GLO', 'gloAmount')}
                        className={`flex-1 bg-sarcophagus-800 border rounded-lg px-4 py-2 text-sarcophagus-100 placeholder-sarcophagus-500 focus:outline-none focus:ring-2 focus:ring-accent-gold ${
                          inputValidation.gloAmount?.error ? 'border-red-500' : 
                          inputValidation.gloAmount?.success ? 'border-green-500' : 'border-sarcophagus-600'
                        }`}
                        placeholder="0.0"
                        step="0.01"
                        min="0"
                      />
                      <button
                        onClick={() => setMaxAmount((userSarcophagus?.gloAmount || 0n).toString(), setGloAmount, 'gloAmount')}
                        className="bg-sarcophagus-700 hover:bg-sarcophagus-600 text-sarcophagus-200 px-3 py-2 rounded-lg text-sm transition-colors"
                      >
                        Max
                      </button>
                    </div>
                    {inputValidation.gloAmount?.error && (
                      <p className="text-red-400 text-sm mt-1">{inputValidation.gloAmount.error}</p>
                    )}
                    {inputValidation.gloAmount?.success && (
                      <p className="text-green-400 text-sm mt-1">{inputValidation.gloAmount.success}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleDepositTokens}
                  disabled={!vetAmount && !vthoAmount && !b3trAmount}
                  className="w-full mt-6 bg-gradient-to-r from-accent-gold to-accent-bronze text-sarcophagus-950 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Deposit Tokens
                </button>
              </div>
            </div>
          )}

          {/* Other tab panels would go here... */}
          
          {/* Legal Agreement Modal */}
          {showLegalAgreement && pendingAction && (
            <LegalAgreement
              onAccept={handleLegalAgreementAccept}
              onDecline={handleLegalAgreementDecline}
              actionType={pendingAction.type}
            />
          )}
        </div>
      </div>
    </div>
  )
} 