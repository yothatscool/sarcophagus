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

export default function VaultManagementModal({ vault, isOpen, onClose, defaultTab }: VaultManagementModalProps) {
  const { showNotification } = useNotification()
  const { isLoading } = useLoading()
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
    type: 'deposit' | 'lock' | 'convert',
    action: () => Promise<void>
  } | null>(null)

  // NFT-related state
  const [nftSearchTerm, setNftSearchTerm] = useState('')
  const [selectedCollection, setSelectedCollection] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [nftValues, setNftValues] = useState<{[key: string]: string}>({})
  const [nftBeneficiaries, setNftBeneficiaries] = useState<{[key: string]: string}>({})
  const [selectedNFTs, setSelectedNFTs] = useState<Set<string>>(new Set())
  const [nftValueValidation, setNftValueValidation] = useState<{[key: string]: string | null}>({})

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
    { label: 'VET', value: userSarcophagus.vetAmount },
    { label: 'VTHO', value: userSarcophagus.vthoAmount },
    { label: 'B3TR', value: userSarcophagus.b3trAmount },
    { label: 'OBOL', value: userSarcophagus.obolAmount },
    { label: 'GLO', value: userSarcophagus.gloAmount },
  ] : [];

  // Beneficiary options for NFT assignment
  const beneficiaryOptions = vault?.beneficiaries?.map(beneficiary => ({
    value: beneficiary.address,
    label: beneficiary.address
  })) || [];

  // Accessibility refs
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const firstTabRef = useRef<HTMLButtonElement>(null)

  // Input validation state
  const [inputValidation, setInputValidation] = useState<{[key: string]: InputValidation}>({})

  // Keyboard navigation for tabs
  const tabListRef = useRef<HTMLDivElement>(null)
  const tabRefs = [useRef<HTMLButtonElement>(null), useRef<HTMLButtonElement>(null), useRef<HTMLButtonElement>(null), useRef<HTMLButtonElement>(null), useRef<HTMLButtonElement>(null), useRef<HTMLButtonElement>(null), useRef<HTMLButtonElement>(null)]
  const tabKeys = ['deposit', 'obol', 'b3tr', 'beneficiaries', 'info', 'nfts', 'convert']

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

  // Input validation functions
  const validateAmount = (amount: string, maxAmount: string, tokenName: string): InputValidation => {
    if (!amount || parseFloat(amount) <= 0) {
      return { isValid: false, error: `Please enter a valid ${tokenName} amount` }
    }
    
    // For deposits, we should check wallet balance, not vault balance
    // For now, let's allow any reasonable amount and let the contract handle validation
    const inputAmount = parseFloat(amount)
    if (inputAmount > 1000000) { // Sanity check - no one has 1M tokens
      return { isValid: false, error: `Amount too high for ${tokenName}` }
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
    // For deposits, we can't easily get wallet balance from the contract
    // So let's set a reasonable default or let user input manually
    const defaultAmount = "100" // Default to 100 tokens
    setter(defaultAmount)
    setInputValidation(prev => ({ ...prev, [fieldName]: { isValid: true, success: 'Default amount set - adjust as needed' } }))
  }

  // Update deposit/lock/convert actions to use validation
  const handleDepositTokens = async () => {
    const hasValidInput = (vetAmount && inputValidation.vetAmount?.isValid) ||
                         (vthoAmount && inputValidation.vthoAmount?.isValid) ||
                         (b3trAmount && inputValidation.b3trAmount?.isValid) ||
                         (obolAmount && inputValidation.obolAmount?.isValid)

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
        setObolAmount('')
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

  const handleBatchLockNFTs = async () => {
    const selectedNFTs = userNFTs?.filter(nft => {
      const beneficiary = nftBeneficiaries[`${nft.contractAddress}-${nft.tokenId}`]
      const value = nftValues[`${nft.contractAddress}-${nft.tokenId}`]
      return beneficiary && value && parseFloat(value) > 0 && !nft.isLocked
    }) || []

    if (selectedNFTs.length === 0) {
      showNotification('Please select NFTs to lock with beneficiaries and values', 'warning')
      return
    }

    try {
      for (const nft of selectedNFTs) {
        const beneficiary = nftBeneficiaries[`${nft.contractAddress}-${nft.tokenId}`]
        const value = nftValues[`${nft.contractAddress}-${nft.tokenId}`]
        await lockNFT(nft.contractAddress, nft.tokenId, ethers.parseEther(value), beneficiary)
      }
      showNotification(`Successfully locked ${selectedNFTs.length} NFTs!`, 'success')
    } catch (error) {
      console.error('Error in batch lock:', error)
      showNotification('Some NFTs failed to lock', 'error')
    }
  }

  // Focus management
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

  // Keyboard navigation for tabs
  useEffect(() => {
    if (!isOpen) return
    const handleTabKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.getAttribute('role') === 'tab') {
        const currentIndex = tabKeys.indexOf(activeTab)
        if (e.key === 'ArrowRight') {
          const nextIndex = (currentIndex + 1) % tabKeys.length
          setActiveTab(tabKeys[nextIndex] as typeof activeTab)
          tabRefs[nextIndex].current?.focus()
          e.preventDefault()
        } else if (e.key === 'ArrowLeft') {
          const prevIndex = (currentIndex - 1 + tabKeys.length) % tabKeys.length
          setActiveTab(tabKeys[prevIndex] as typeof activeTab)
          tabRefs[prevIndex].current?.focus()
          e.preventDefault()
        }
      }
    }
    tabListRef.current?.addEventListener('keydown', handleTabKeyDown)
    return () => tabListRef.current?.removeEventListener('keydown', handleTabKeyDown)
  }, [activeTab, isOpen])

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
  const handleNFTValueChange = (nftKey: string, value: string, maxValue: string) => {
    setNftValues(prev => ({ ...prev, [nftKey]: value }))
    // Validation
    if (!value || isNaN(Number(value)) || Number(value) <= 0) {
      setNftValueValidation(prev => ({ ...prev, [nftKey]: 'Enter a valid value' }))
    } else if (Number(value) > Number(maxValue)) {
      setNftValueValidation(prev => ({ ...prev, [nftKey]: `Max value is ${maxValue}` }))
    } else {
      setNftValueValidation(prev => ({ ...prev, [nftKey]: null }))
    }
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
        className="bg-sarcophagus-900 border border-sarcophagus-700 rounded-lg w-full max-w-4xl mx-4 max-h-[95vh] overflow-y-auto sm:max-w-2xl"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="p-4 sm:p-4 sm:p-4 sm:p-6 border-b border-sarcophagus-700">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h2 id="modal-title" className="text-lg sm:text-xl font-bold text-sarcophagus-100 truncate">
                Manage Vault #{vault.id}
              </h2>
              <p id="modal-description" className="text-sarcophagus-400 mt-1 text-sm">
                Manage your vault tokens, NFTs, and beneficiaries
              </p>
              
              {/* Trust Signals */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1 text-green-400">
                  <FaShieldAlt />
                  <span>Audited</span>
                </div>
                <a 
                  href="https://explore.vechain.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sarcophagus-400 hover:text-accent-gold transition-colors"
                >
                  <FaExternalLinkAlt />
                  <span>Explorer</span>
                </a>
                <div className="flex items-center gap-1 text-sarcophagus-400">
                  <span>VeChain</span>
                </div>
              </div>
            </div>
            
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="text-sarcophagus-400 hover:text-sarcophagus-200 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-gold rounded p-2 ml-2"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div 
          className="flex border-b border-sarcophagus-700 overflow-x-auto scrollbar-hide"
          role="tablist"
          aria-label="Vault management tabs"
          ref={tabListRef}
        >
          {tabKeys.map((key, idx) => (
            <button
              key={key}
              ref={tabRefs[idx]}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`px-3 sm:px-3 sm:px-6 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-gold rounded-t whitespace-nowrap min-w-fit ${
                activeTab === key
                  ? 'text-accent-gold border-b-2 border-accent-gold'
                  : 'text-sarcophagus-400 hover:text-sarcophagus-200'
              }`}
              role="tab"
              aria-selected={activeTab === key}
              aria-controls={`${key}-panel`}
              id={`${key}-tab`}
              tabIndex={activeTab === key ? 0 : -1}
            >
              {key.charAt(0).toUpperCase() + key.slice(1).replace('b3tr', 'B3TR').replace('obol', 'OBOL')}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-4 sm:p-6">
          {/* Token Balances */}
          {userSarcophagus && (
            <div className="mb-6 p-3 sm:p-4 bg-sarcophagus-800/30 border border-sarcophagus-700 rounded-lg">
              <h3 className="text-sm font-semibold text-sarcophagus-200 mb-3">Vault Balances</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                {tokenBalances.map((balance) => (
                  <div key={balance.label} className="text-center">
                    <div className="text-sarcophagus-400 text-xs">{balance.label}</div>
                    <div className="text-sarcophagus-100 font-medium text-sm">
                      {ethers.formatEther(balance.value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Panels */}
          {activeTab === 'deposit' && (
            <div id="deposit-panel" role="tabpanel" aria-labelledby="deposit-tab" tabIndex={0}>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-sarcophagus-100 mb-3 sm:mb-4">Deposit Tokens</h3>
                  <p className="text-sarcophagus-400 mb-4 text-sm">
                    Deposit VET, VTHO, B3TR, OBOL, or GLO tokens into your vault. Earn $B3TR rewards upon inheritance!
                  </p>
                  
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
                          placeholder="0.0"
                          className={`flex-1 bg-sarcophagus-800 border rounded-lg px-3 sm:px-4 py-3 text-sarcophagus-100 placeholder-sarcophagus-500 focus:outline-none focus:ring-2 focus:ring-accent-gold ${
                            inputValidation.vetAmount?.error ? 'border-red-500' : 
                            inputValidation.vetAmount?.success ? 'border-green-500' : 'border-sarcophagus-600'
                          }`}
                          step="0.01"
                          min="0"
                        />
                        <button
                          onClick={() => setMaxAmount((userSarcophagus?.vetAmount || 0n).toString(), setVetAmount, 'vetAmount')}
                          className="bg-sarcophagus-700 hover:bg-sarcophagus-600 text-sarcophagus-200 px-4 py-3 rounded-lg text-sm transition-colors min-w-[60px]"
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
                    
                    <div>
                      <label className="block text-sm font-medium text-sarcophagus-300 mb-2">
                        VTHO Amount
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={vthoAmount}
                          onChange={(e) => handleAmountChange(e.target.value, setVthoAmount, (userSarcophagus?.vthoAmount || 0n).toString(), 'VTHO', 'vthoAmount')}
                          placeholder="0.0"
                          className={`flex-1 bg-sarcophagus-800 border rounded-lg px-3 sm:px-4 py-3 text-sarcophagus-100 placeholder-sarcophagus-500 focus:outline-none focus:ring-2 focus:ring-accent-gold ${
                            inputValidation.vthoAmount?.error ? 'border-red-500' : 
                            inputValidation.vthoAmount?.success ? 'border-green-500' : 'border-sarcophagus-600'
                          }`}
                          step="0.01"
                          min="0"
                        />
                        <button
                          onClick={() => setMaxAmount((userSarcophagus?.vthoAmount || 0n).toString(), setVthoAmount, 'vthoAmount')}
                          className="bg-sarcophagus-700 hover:bg-sarcophagus-600 text-sarcophagus-200 px-4 py-3 rounded-lg text-sm transition-colors min-w-[60px]"
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
                    
                    <div>
                      <label className="block text-sm font-medium text-sarcophagus-300 mb-2">
                        B3TR Amount
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={b3trAmount}
                          onChange={(e) => handleAmountChange(e.target.value, setB3trAmount, (userSarcophagus?.b3trAmount || 0n).toString(), 'B3TR', 'b3trAmount')}
                          placeholder="0.0"
                          className={`flex-1 bg-sarcophagus-800 border rounded-lg px-3 sm:px-4 py-3 text-sarcophagus-100 placeholder-sarcophagus-500 focus:outline-none focus:ring-2 focus:ring-accent-gold ${
                            inputValidation.b3trAmount?.error ? 'border-red-500' : 
                            inputValidation.b3trAmount?.success ? 'border-green-500' : 'border-sarcophagus-600'
                          }`}
                          step="0.01"
                          min="0"
                        />
                        <button
                          onClick={() => setMaxAmount((userSarcophagus?.b3trAmount || 0n).toString(), setB3trAmount, 'b3trAmount')}
                          className="bg-sarcophagus-700 hover:bg-sarcophagus-600 text-sarcophagus-200 px-4 py-3 rounded-lg text-sm transition-colors min-w-[60px]"
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

                    <div>
                      <label className="block text-sm font-medium text-sarcophagus-300 mb-2">
                        OBOL Amount
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={obolAmount}
                          onChange={(e) => handleAmountChange(e.target.value, setObolAmount, (userSarcophagus?.obolAmount || 0n).toString(), 'OBOL', 'obolAmount')}
                          placeholder="0.0"
                          className={`flex-1 bg-sarcophagus-800 border rounded-lg px-3 sm:px-4 py-3 text-sarcophagus-100 placeholder-sarcophagus-500 focus:outline-none focus:ring-2 focus:ring-accent-gold ${
                            inputValidation.obolAmount?.error ? 'border-red-500' : 
                            inputValidation.obolAmount?.success ? 'border-green-500' : 'border-sarcophagus-600'
                          }`}
                          step="0.01"
                          min="0"
                        />
                        <button
                          onClick={() => setMaxAmount((userSarcophagus?.obolAmount || 0n).toString(), setObolAmount, 'obolAmount')}
                          className="bg-sarcophagus-700 hover:bg-sarcophagus-600 text-sarcophagus-200 px-4 py-3 rounded-lg text-sm transition-colors min-w-[60px]"
                        >
                          Max
                        </button>
                      </div>
                      {inputValidation.obolAmount?.error && (
                        <p className="text-red-400 text-sm mt-1">{inputValidation.obolAmount.error}</p>
                      )}
                      {inputValidation.obolAmount?.success && (
                        <p className="text-green-400 text-sm mt-1">{inputValidation.obolAmount.success}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-sarcophagus-300 mb-2">
                        GLO Amount
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={gloAmount}
                          onChange={(e) => handleAmountChange(e.target.value, setGloAmount, (userSarcophagus?.gloAmount || 0n).toString(), 'GLO', 'gloAmount')}
                          placeholder="0.0"
                          className={`flex-1 bg-sarcophagus-800 border rounded-lg px-3 sm:px-4 py-3 text-sarcophagus-100 placeholder-sarcophagus-500 focus:outline-none focus:ring-2 focus:ring-accent-gold ${
                            inputValidation.gloAmount?.error ? 'border-red-500' : 
                            inputValidation.gloAmount?.success ? 'border-green-500' : 'border-sarcophagus-600'
                          }`}
                          step="0.01"
                          min="0"
                        />
                        <button
                          onClick={() => setMaxAmount((userSarcophagus?.gloAmount || 0n).toString(), setGloAmount, 'gloAmount')}
                          className="bg-sarcophagus-700 hover:bg-sarcophagus-600 text-sarcophagus-200 px-4 py-3 rounded-lg text-sm transition-colors min-w-[60px]"
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
                  
                  <div className="mt-6">
                    <button
                      onClick={handleDepositTokens}
                      disabled={isLoading.depositTokens}
                      className="w-full bg-gradient-to-r from-accent-gold to-accent-bronze text-sarcophagus-950 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isLoading.depositTokens ? 'Depositing...' : 'Deposit Tokens'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'obol' && (
            <div id="obol-panel" role="tabpanel" aria-labelledby="obol-tab" tabIndex={0}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-sarcophagus-100 mb-4">$OBOL Rewards & Locking</h3>
                  
                  {/* OBOL Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-sarcophagus-800/80 border border-sarcophagus-700 rounded-lg p-4">
                      <div className="text-2xl font-bold text-accent-gold">{vault.obolRewards}</div>
                      <div className="text-sarcophagus-400 text-sm">$OBOL Earned</div>
                    </div>
                    <div className="bg-sarcophagus-800/80 border border-sarcophagus-700 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-400">{vault.obolLocked}</div>
                      <div className="text-sarcophagus-400 text-sm">$OBOL Locked</div>
                    </div>
                    <div className="bg-sarcophagus-800/80 border border-sarcophagus-700 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-400">10:1</div>
                      <div className="text-sarcophagus-400 text-sm">Reward Rate</div>
                    </div>
                  </div>

                  {/* Lock OBOL Tokens */}
                  <div className="bg-sarcophagus-800/50 border border-sarcophagus-700 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-accent-gold mb-3">Lock $OBOL Tokens</h4>
                    <p className="text-sarcophagus-400 text-sm mb-4">
                      Lock your earned $OBOL tokens in the vault. They will be distributed to beneficiaries upon death verification.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-sarcophagus-300 mb-2">
                          $OBOL Amount to Lock
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={obolAmount}
                            onChange={(e) => handleAmountChange(e.target.value, setObolAmount, (userSarcophagus?.obolAmount || 0n).toString(), 'OBOL', 'obolAmount')}
                            placeholder="0.0"
                            className={`flex-1 bg-sarcophagus-800 border rounded-lg px-3 sm:px-4 py-3 text-sarcophagus-100 placeholder-sarcophagus-500 focus:outline-none focus:ring-2 focus:ring-accent-gold ${
                              inputValidation.obolAmount?.error ? 'border-red-500' : 
                              inputValidation.obolAmount?.success ? 'border-green-500' : 'border-sarcophagus-600'
                            }`}
                            step="0.01"
                            min="0"
                          />
                          <button
                            onClick={() => setMaxAmount((userSarcophagus?.obolAmount || 0n).toString(), setObolAmount, 'obolAmount')}
                            className="bg-sarcophagus-700 hover:bg-sarcophagus-600 text-sarcophagus-200 px-3 py-2 rounded-lg text-sm transition-colors"
                          >
                            Max
                          </button>
                        </div>
                        {inputValidation.obolAmount?.error && (
                          <p className="text-red-400 text-sm mt-1">{inputValidation.obolAmount.error}</p>
                        )}
                        {inputValidation.obolAmount?.success && (
                          <p className="text-green-400 text-sm mt-1">{inputValidation.obolAmount.success}</p>
                        )}
                      </div>
                      
                      <button
                        onClick={handleLockObolTokens}
                        disabled={isLoading.lockObol}
                        className="w-full bg-gradient-to-r from-accent-gold to-accent-bronze text-sarcophagus-950 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {isLoading.lockObol ? 'Locking...' : 'Lock $OBOL Tokens'}
                      </button>
                    </div>
                  </div>

                  {/* Reward Info */}
                  <div className="bg-sarcophagus-800/30 border border-sarcophagus-700 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-accent-gold mb-2">Reward Information</h4>
                    <ul className="text-sarcophagus-400 text-sm space-y-1">
                      <li>• Earn OBOL rewards on <b>all tokens locked in your vault</b> (VET, VTHO, B3TR, OBOL), based on their VET-equivalent value.</li>
                      <li>• <b>Conversion rates:</b> 1 VET = 1 VET, 1 VTHO = 0.0001 VET, 1 B3TR = 0.001 VET, 1 OBOL = 0.01 VET.</li>
                      <li>• <b>Hard Cap:</b> Maximum 1,500 OBOL in unclaimed rewards. Claim regularly to continue earning!</li>
                      <li>• Rewards are automatically calculated and updated on every deposit or lock.</li>
                      <li>• Lock any combination of supported tokens to maximize your OBOL earnings.</li>
                      <li>• Total supply: 100,000,000 $OBOL</li>
                      <li>• 95% of supply distributed as rewards</li>
                    </ul>
                  </div>

                  {/* Grandfathering Info */}
                  <div className="bg-sarcophagus-800/30 border border-sarcophagus-700 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-accent-gold mb-2">OBOL Grandfathering</h4>
                    <p className="text-sarcophagus-400 text-sm mb-3">
                      When beneficiaries inherit, they can preserve the same $OBOL earning rate by creating a new vault and locking their inheritance within 90 days.
                    </p>
                    <ul className="text-sarcophagus-400 text-sm space-y-1">
                      <li>• Beneficiaries can create vaults anytime (no time limit)</li>
                      <li>• 90-day deadline is ONLY for preserving the original OBOL rate</li>
                      <li>• Lock inheritance within 90 days → Get deceased user's OBOL rate</li>
                      <li>• Lock inheritance after 90 days → Get standard new user OBOL rate</li>
                      <li>• No vault creation → No continuous OBOL earning</li>
                      <li>• This preserves generational wealth through OBOL earning</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'b3tr' && (
            <div id="b3tr-panel" role="tabpanel" aria-labelledby="b3tr-tab" tabIndex={0}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-sarcophagus-100 mb-4">$B3TR Rewards</h3>
                  
                  {/* B3TR Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-sarcophagus-800/80 border border-sarcophagus-700 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-400">Personalized</div>
                      <div className="text-sarcophagus-400 text-sm">Carbon Footprint/Year</div>
                    </div>
                    <div className="bg-sarcophagus-800/80 border border-sarcophagus-700 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-400">100 B3TR</div>
                      <div className="text-sarcophagus-400 text-sm">For Reaching Life Expectancy + Per Year Past</div>
                    </div>
                  </div>

                  {/* Inheritance Bonus Info */}
                  <div className="bg-sarcophagus-800/80 border border-sarcophagus-700 rounded-lg p-4 mb-6">
                    <h4 className="text-md font-semibold text-accent-gold mb-3">Carbon & Legacy Rewards</h4>
                    <p className="text-sarcophagus-400 text-sm mb-4">
                      When beneficiaries inherit, they receive $B3TR rewards based on carbon saved and legacy bonuses.
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sarcophagus-400 text-sm">Carbon Offset:</span>
                        <span className="text-green-400 font-semibold">Years saved × personalized CO2 footprint/year</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sarcophagus-400 text-sm">Legacy Bonus:</span>
                        <span className="text-blue-400 font-semibold">100 B3TR for reaching life expectancy + 100 B3TR per year past it</span>
                      </div>
                    </div>
                  </div>

                  {/* Reward Info */}
                  <div className="bg-sarcophagus-800/80 border border-sarcophagus-700 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-accent-gold mb-2">Carbon & Legacy Reward Information</h4>
                    <ul className="text-sarcophagus-400 text-sm space-y-1">
                      <li>• Carbon offset: Years of life saved × personalized CO2 footprint/year</li>
                      <li>• Legacy bonus: 100 B3TR for reaching your life expectancy + 100 B3TR for each year past it</li>
                      <li>• Rewards are paid immediately upon inheritance claim</li>
                      <li>• Sustainable rewards from Vebetter DAO</li>
                      <li>• No additional requirements or time limits</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'beneficiaries' && (
            <div id="beneficiaries-panel" role="tabpanel" aria-labelledby="beneficiaries-tab" tabIndex={0}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-sarcophagus-100 mb-4">Beneficiaries</h3>
                  
                  <div className="space-y-3">
                    {vault.beneficiaries.map((beneficiary, index) => (
                      <div key={index} className="bg-sarcophagus-800/80 border border-sarcophagus-700 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-sarcophagus-100 font-medium">
                              {beneficiary.address.slice(0, 6)}...{beneficiary.address.slice(-4)}
                            </div>
                            <div className="text-sarcophagus-400 text-sm">
                              Beneficiary #{index + 1}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-accent-gold font-semibold">{beneficiary.percentage}%</div>
                            <div className="text-sarcophagus-400 text-sm">Share</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-4 bg-sarcophagus-800/30 border border-sarcophagus-700 rounded-lg">
                    <h4 className="text-md font-semibold text-accent-gold mb-2">Distribution Details</h4>
                    <p className="text-sarcophagus-400 text-sm">
                      Upon death verification, all locked tokens (VET, VTHO, B3TR, and $OBOL) will be distributed 
                      to beneficiaries according to their percentage shares, plus $B3TR carbon offset and legacy bonuses.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div id="info-panel" role="tabpanel" aria-labelledby="info-tab" tabIndex={0}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-sarcophagus-100 mb-4">Vault Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="bg-sarcophagus-800/80 border border-sarcophagus-700 rounded-lg p-4">
                        <div className="text-sarcophagus-400 text-sm">Total Value</div>
                        <div className="text-sarcophagus-100 font-semibold">{vault.totalValue}</div>
                      </div>
                      
                      <div className="bg-sarcophagus-800/80 border border-sarcophagus-700 rounded-lg p-4">
                        <div className="text-sarcophagus-400 text-sm">Life Expectancy</div>
                        <div className="text-sarcophagus-100 font-semibold">{vault.lifeExpectancy} years</div>
                      </div>
                      
                      <div className="bg-sarcophagus-800/80 border border-sarcophagus-700 rounded-lg p-4">
                        <div className="text-sarcophagus-400 text-sm">Created</div>
                        <div className="text-sarcophagus-100 font-semibold">
                          {vault.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-sarcophagus-800/80 border border-sarcophagus-700 rounded-lg p-4">
                        <div className="text-sarcophagus-400 text-sm">Status</div>
                        <div className={`font-semibold ${
                          vault.status === 'active' ? 'text-green-400' :
                          vault.status === 'pending' ? 'text-accent-gold' : 'text-blue-400'
                        }`}>
                          {vault.status.toUpperCase()}
                        </div>
                      </div>
                      
                      <div className="bg-sarcophagus-800/80 border border-sarcophagus-700 rounded-lg p-4">
                        <div className="text-sarcophagus-400 text-sm">$B3TR Carbon Offset</div>
                        <div className="text-green-400 font-semibold">Years saved × personalized CO2 footprint/year</div>
                      </div>
                      
                      <div className="bg-sarcophagus-800/80 border border-sarcophagus-700 rounded-lg p-4">
                        <div className="text-sarcophagus-400 text-sm">$B3TR Legacy Bonus</div>
                        <div className="text-blue-400 font-semibold">100 B3TR for reaching life expectancy + 100 B3TR per year past it</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-sarcophagus-800/30 border border-sarcophagus-700 rounded-lg">
                    <h4 className="text-md font-semibold text-accent-gold mb-2">Vault Security</h4>
                    <ul className="text-sarcophagus-400 text-sm space-y-1">
                      <li>• Smart contract secured on VeChain blockchain</li>
                      <li>• Death verification required for distribution</li>
                      <li>• Anti-farming measures prevent abuse</li>
                      <li>• Rate limiting on deposits</li>
                      <li>• Minimum lock periods enforced</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'nfts' && (
            <div id="nfts-panel" role="tabpanel" aria-labelledby="nfts-tab" tabIndex={0}>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-sarcophagus-100 mb-4">NFT Management</h3>
                  
                  {/* Batch Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <button 
                      onClick={handleSelectAllNFTs} 
                      className="bg-sarcophagus-700 hover:bg-sarcophagus-600 text-sarcophagus-200 px-3 sm:px-4 py-3 rounded text-sm transition-colors"
                    >
                      Select All
                    </button>
                    <button 
                      onClick={handleDeselectAllNFTs} 
                      className="bg-sarcophagus-700 hover:bg-sarcophagus-600 text-sarcophagus-200 px-3 sm:px-4 py-3 rounded text-sm transition-colors"
                    >
                      Deselect All
                    </button>
                  </div>

                  {/* NFT Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {userNFTs?.map((nft, idx) => {
                      const nftKey = `${nft.contractAddress}-${nft.tokenId}`
                      return (
                        <div key={nftKey} className={`bg-sarcophagus-800/60 border rounded-lg p-3 sm:p-4 ${selectedNFTs.has(nftKey) ? 'border-accent-gold' : 'border-sarcophagus-700'}`}>
                          <div className="flex items-center mb-3">
                            <input 
                              type="checkbox" 
                              checked={selectedNFTs.has(nftKey)} 
                              onChange={() => handleToggleNFT(nftKey)} 
                              className="mr-3 w-4 h-4" 
                            />
                            <span className="font-semibold text-sarcophagus-100 text-sm truncate">{nft.name}</span>
                          </div>
                          
                          <img 
                            src={nft.imageUrl || 'https://via.placeholder.com/200x200/6366f1/ffffff?text=NFT'} 
                            alt={nft.name} 
                            className="w-full h-24 sm:h-32 object-cover rounded-lg mb-3" 
                          />
                          
                          <div className="text-xs text-sarcophagus-400 mb-3">ID: {nft.tokenId.toString()}</div>
                          
                          {/* Beneficiary Selection */}
                          <div className="mb-3">
                            <label className="block text-xs font-medium text-sarcophagus-300 mb-1">Beneficiary</label>
                            <select
                              value={nftBeneficiaries[nftKey] || ''}
                              onChange={e => setNftBeneficiaries(prev => ({ ...prev, [nftKey]: e.target.value }))}
                              className="w-full bg-sarcophagus-900 border border-sarcophagus-600 rounded px-2 py-1 text-sarcophagus-100 text-xs"
                            >
                              <option value="">Select beneficiary</option>
                              {beneficiaryOptions.map(b => (
                                <option key={b.value} value={b.value}>
                                  {b.label.slice(0, 6)}...{b.label.slice(-4)}
                                </option>
                              ))}
                            </select>
                            {!nftBeneficiaries[nftKey] && (
                              <p className="text-red-400 text-xs mt-1">Select a beneficiary</p>
                            )}
                          </div>
                          
                          {/* Value Input */}
                          <div className="mb-3">
                            <label className="block text-xs font-medium text-sarcophagus-300 mb-1">Value (VET)</label>
                            <input
                              type="number"
                              value={nftValues[nftKey] || ''}
                              onChange={e => handleNFTValueChange(nftKey, e.target.value, ethers.formatEther(nft.estimatedValue || 0n))}
                              className={`w-full bg-sarcophagus-900 border rounded px-2 py-1 text-sarcophagus-100 text-xs ${
                                nftValueValidation[nftKey] ? 'border-red-500' : 'border-sarcophagus-600'
                              }`}
                              placeholder="0.0"
                              min="0"
                              step="0.01"
                            />
                            {nftValueValidation[nftKey] && (
                              <p className="text-red-400 text-xs mt-1">{nftValueValidation[nftKey]}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Batch Lock Button */}
                  <button
                    onClick={handleBatchLockNFTs}
                    disabled={selectedNFTs.size === 0}
                    className="w-full mt-6 bg-gradient-to-r from-accent-gold to-accent-bronze text-sarcophagus-950 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Lock Selected NFTs ({selectedNFTs.size})
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'convert' && (
            <div id="convert-panel" role="tabpanel" aria-labelledby="convert-tab" tabIndex={0}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-sarcophagus-100 mb-4">Convert Tokens</h3>
                  <p className="text-sarcophagus-400 mb-4">
                    Convert tokens between different types in your vault.
                  </p>
                  <div className="space-y-4">
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-sarcophagus-300 mb-2">
                          From Token
                        </label>
                        <select
                          value={convertFromToken}
                          onChange={(e) => setConvertFromToken(e.target.value)}
                          className="w-full bg-sarcophagus-800 border border-sarcophagus-600 rounded-lg px-3 sm:px-4 py-3 text-sarcophagus-100 focus:outline-none focus:border-accent-gold"
                        >
                          <option value="">Select token</option>
                          {supportedTokens.map(token => (
                            <option key={token.address} value={token.address}>
                              {token.symbol} - {token.name}
                            </option>
                          ))}
                        </select>
                        {convertFromToken && (
                          <div className="text-xs text-sarcophagus-400 mt-1">
                            Balance: {ethers.formatEther(supportedTokens.find(t => t.address === convertFromToken)?.balance || 0)} | Price: {supportedTokens.find(t => t.address === convertFromToken)?.price ? ethers.formatEther(supportedTokens.find(t => t.address === convertFromToken)?.price || 0) : 'N/A'} VET
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setConvertFromToken(convertToToken)
                          setConvertToToken(convertFromToken)
                          setConvertFromAmount('')
                          setConvertMinToAmount('')
                          setConversionRate('')
                          setConvertError(null)
                          setConvertSuccess(null)
                        }}
                        className="bg-sarcophagus-700 hover:bg-sarcophagus-600 text-accent-gold rounded-full p-2 mb-6 mt-6 flex items-center justify-center"
                        title="Swap tokens"
                      >
                        <FaSyncAlt />
                      </button>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-sarcophagus-300 mb-2">
                          To Token
                        </label>
                        <select
                          value={convertToToken}
                          onChange={(e) => setConvertToToken(e.target.value)}
                          className="w-full bg-sarcophagus-800 border border-sarcophagus-600 rounded-lg px-3 sm:px-4 py-3 text-sarcophagus-100 focus:outline-none focus:border-accent-gold"
                        >
                          <option value="">Select token</option>
                          {supportedTokens.map(token => (
                            <option key={token.address} value={token.address}>
                              {token.symbol} - {token.name}
                            </option>
                          ))}
                        </select>
                        {convertToToken && (
                          <div className="text-xs text-sarcophagus-400 mt-1">
                            Price: {supportedTokens.find(t => t.address === convertToToken)?.price ? ethers.formatEther(supportedTokens.find(t => t.address === convertToToken)?.price || 0) : 'N/A'} VET
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sarcophagus-300 mb-2">
                        Amount to Convert
                      </label>
                      <input
                        type="number"
                        value={convertFromAmount}
                        onChange={(e) => setConvertFromAmount(e.target.value)}
                        className="w-full bg-sarcophagus-800 border border-sarcophagus-600 rounded-lg px-3 sm:px-4 py-3 text-sarcophagus-100 placeholder-sarcophagus-500 focus:outline-none focus:border-accent-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sarcophagus-300 mb-2">
                        Minimum To Amount (optional)
                      </label>
                      <input
                        type="number"
                        value={convertMinToAmount}
                        onChange={(e) => setConvertMinToAmount(e.target.value)}
                        className="w-full bg-sarcophagus-800 border border-sarcophagus-600 rounded-lg px-3 sm:px-4 py-3 text-sarcophagus-100 placeholder-sarcophagus-500 focus:outline-none focus:border-accent-gold"
                      />
                    </div>
                  </div>
                  {/* Conversion summary card */}
                  {(convertFromToken && convertToToken && convertFromAmount) && (
                    <div className="my-4 p-4 bg-sarcophagus-800 border border-sarcophagus-700 rounded-lg flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sarcophagus-200">Summary:</span>
                        <span>{convertFromAmount} {supportedTokens.find(t => t.address === convertFromToken)?.symbol} → {conversionLoading ? '...' : conversionRate} {supportedTokens.find(t => t.address === convertToToken)?.symbol}</span>
                      </div>
                      {conversionLoading ? (
                        <div className="text-xs text-sarcophagus-400">Fetching rate...</div>
                      ) : conversionRate ? (
                        <div className="text-xs text-green-400">Estimated: {convertFromAmount} {supportedTokens.find(t => t.address === convertFromToken)?.symbol} ≈ {conversionRate} {supportedTokens.find(t => t.address === convertToToken)?.symbol}</div>
                      ) : (
                        <div className="text-xs text-red-400">Unable to fetch conversion rate.</div>
                      )}
                    </div>
                  )}
                  {convertError && <div className="text-red-500 text-sm mb-2">{convertError}</div>}
                  {convertSuccess && <div className="text-green-500 text-sm mb-2">{convertSuccess}</div>}
                  <button
                    onClick={handleConvertTokens}
                    disabled={conversionLoading || !convertFromToken || !convertToToken || !convertFromAmount}
                    className="w-full mt-6 bg-gradient-to-r from-accent-gold to-accent-bronze text-sarcophagus-950 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {conversionLoading ? 'Converting...' : 'Convert Tokens'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {showLegalAgreement && pendingAction && (
        <LegalAgreement
          onAccept={handleLegalAgreementAccept}
          onDecline={handleLegalAgreementDecline}
          actionType={pendingAction.type}
        />
      )}
    </div>
  )
} 
