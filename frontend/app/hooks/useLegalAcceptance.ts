import { useState, useEffect } from 'react'

interface LegalAcceptance {
  termsAccepted: boolean
  privacyAccepted: boolean
  risksAccepted: boolean
  legalAccepted: boolean
  taxAccepted: boolean
  acceptedAt: string | null
  userAddress: string | null
}

export function useLegalAcceptance(userAddress: string | null) {
  const [legalAcceptance, setLegalAcceptance] = useState<LegalAcceptance>({
    termsAccepted: false,
    privacyAccepted: false,
    risksAccepted: false,
    legalAccepted: false,
    taxAccepted: false,
    acceptedAt: null,
    userAddress: null
  })

  const [showLegalDisclosure, setShowLegalDisclosure] = useState(false)

  // Check if user has accepted all terms
  const hasAcceptedAllTerms = legalAcceptance.termsAccepted && 
                             legalAcceptance.privacyAccepted && 
                             legalAcceptance.risksAccepted && 
                             legalAcceptance.legalAccepted && 
                             legalAcceptance.taxAccepted

  // Load legal acceptance from localStorage
  useEffect(() => {
    if (userAddress) {
      const stored = localStorage.getItem(`legal_acceptance_${userAddress}`)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setLegalAcceptance(parsed)
        } catch (error) {
          console.error('Error parsing legal acceptance:', error)
        }
      }
    }
  }, [userAddress])

  // Save legal acceptance to localStorage
  const saveLegalAcceptance = (acceptance: LegalAcceptance) => {
    if (userAddress) {
      localStorage.setItem(`legal_acceptance_${userAddress}`, JSON.stringify(acceptance))
      setLegalAcceptance(acceptance)
    }
  }

  // Accept all legal terms
  const acceptAllTerms = () => {
    const acceptance: LegalAcceptance = {
      termsAccepted: true,
      privacyAccepted: true,
      risksAccepted: true,
      legalAccepted: true,
      taxAccepted: true,
      acceptedAt: new Date().toISOString(),
      userAddress: userAddress
    }
    saveLegalAcceptance(acceptance)
    setShowLegalDisclosure(false)
  }

  // Decline terms
  const declineTerms = () => {
    setShowLegalDisclosure(false)
    // Could redirect to a page explaining why terms are required
  }

  // Check if user needs to accept terms
  const needsLegalAcceptance = userAddress && !hasAcceptedAllTerms

  // Show legal disclosure if needed
  useEffect(() => {
    if (needsLegalAcceptance) {
      setShowLegalDisclosure(true)
    }
  }, [needsLegalAcceptance])

  return {
    legalAcceptance,
    hasAcceptedAllTerms,
    showLegalDisclosure,
    setShowLegalDisclosure,
    acceptAllTerms,
    declineTerms,
    needsLegalAcceptance
  }
} 