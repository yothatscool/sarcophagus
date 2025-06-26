// Death Verification API Integration
// Multi-source death verification for inheritance claims

import { getEnvironmentConfig } from '../config/environment';

export interface DeathVerificationData {
  fullName: string;
  dateOfBirth: string;
  dateOfDeath: string;
  location: string;
  country: string;
  source: 'SSDI' | 'Government Registry' | 'News' | 'Obituary' | 'Manual';
  confidence: 'high' | 'medium' | 'low';
  verificationId: string;
  timestamp: string;
}

export interface DeathVerificationResult {
  isVerified: boolean;
  data: DeathVerificationData | null;
  sources: string[];
  confidence: 'high' | 'medium' | 'low';
  error?: string;
}

export interface SSDIQuery {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  dateOfDeath?: string;
  ssn?: string;
}

export interface NewsQuery {
  name: string;
  location?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Static fallback data for development/testnet
const MOCK_DEATH_VERIFICATIONS: Record<string, DeathVerificationData> = {
  'john-doe-123': {
    fullName: 'John Doe',
    dateOfBirth: '1950-03-15',
    dateOfDeath: '2023-11-20',
    location: 'New York, NY',
    country: 'US',
    source: 'SSDI',
    confidence: 'high',
    verificationId: 'SSDI-2023-12345',
    timestamp: '2023-11-21T10:30:00Z'
  },
  'jane-smith-456': {
    fullName: 'Jane Smith',
    dateOfBirth: '1945-07-22',
    dateOfDeath: '2023-10-15',
    location: 'London, UK',
    country: 'UK',
    source: 'Government Registry',
    confidence: 'high',
    verificationId: 'UK-GOV-2023-789',
    timestamp: '2023-10-16T14:20:00Z'
  }
};

class DeathVerificationApiService {
  private config = getEnvironmentConfig();
  private cache: Map<string, { data: DeathVerificationResult; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Verify death using multiple sources
   */
  async verifyDeath(
    fullName: string,
    dateOfBirth: string,
    country: string,
    additionalData?: {
      ssn?: string;
      location?: string;
      dateOfDeath?: string;
    }
  ): Promise<DeathVerificationResult> {
    const cacheKey = `death_${fullName}_${dateOfBirth}_${country}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    if (this.config.isDevelopment || this.config.isTestnet) {
      return this.getMockVerification(fullName, dateOfBirth, country);
    }

    try {
      const results = await Promise.allSettled([
        this.verifyDeathSSDI(fullName, dateOfBirth, additionalData?.ssn),
        this.verifyDeathGovernmentRegistry(fullName, dateOfBirth, country),
        this.verifyDeathNews(fullName, additionalData?.location, additionalData?.dateOfDeath)
      ]);

      const verifiedResults = results
        .filter((result): result is PromiseFulfilledResult<DeathVerificationResult> => 
          result.status === 'fulfilled' && result.value.isVerified
        )
        .map(result => result.value);

      if (verifiedResults.length === 0) {
        const result: DeathVerificationResult = {
          isVerified: false,
          data: null,
          sources: [],
          confidence: 'low',
          error: 'No death verification found in any source'
        };
        this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      }

      // Combine results and determine confidence
      const combinedResult = this.combineVerificationResults(verifiedResults);
      this.cache.set(cacheKey, { data: combinedResult, timestamp: Date.now() });
      return combinedResult;

    } catch (error) {
      console.error('Error in death verification:', error);
      return {
        isVerified: false,
        data: null,
        sources: [],
        confidence: 'low',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Verify death using Social Security Death Index (US only)
   */
  private async verifyDeathSSDI(
    fullName: string,
    dateOfBirth: string,
    ssn?: string
  ): Promise<DeathVerificationResult> {
    try {
      // In production, this would call a real SSDI API
      // For now, we'll simulate the API call
      const [firstName, lastName] = fullName.split(' ');
      
      const query: SSDIQuery = {
        firstName,
        lastName,
        dateOfBirth,
        ssn
      };

      // Simulate API call to SSDI service
      const response = await this.callSSDIAPI(query);
      
      if (response && response.isDeceased) {
        return {
          isVerified: true,
          data: {
            fullName,
            dateOfBirth,
            dateOfDeath: response.dateOfDeath,
            location: response.location || 'Unknown',
            country: 'US',
            source: 'SSDI',
            confidence: 'high',
            verificationId: `SSDI-${Date.now()}`,
            timestamp: new Date().toISOString()
          },
          sources: ['SSDI'],
          confidence: 'high'
        };
      }

      return {
        isVerified: false,
        data: null,
        sources: ['SSDI'],
        confidence: 'low'
      };

    } catch (error) {
      console.error('SSDI verification error:', error);
      return {
        isVerified: false,
        data: null,
        sources: ['SSDI'],
        confidence: 'low',
        error: error instanceof Error ? error.message : 'SSDI API error'
      };
    }
  }

  /**
   * Verify death using government death registries
   */
  private async verifyDeathGovernmentRegistry(
    fullName: string,
    dateOfBirth: string,
    country: string
  ): Promise<DeathVerificationResult> {
    try {
      // Map countries to their respective registry APIs
      const registryAPIs = {
        'US': 'https://api.ssa.gov/death-verification',
        'UK': 'https://api.gov.uk/death-registry',
        'CA': 'https://api.canada.ca/death-registry',
        'AU': 'https://api.australia.gov.au/death-registry'
      };

      const apiUrl = registryAPIs[country as keyof typeof registryAPIs];
      if (!apiUrl) {
        return {
          isVerified: false,
          data: null,
          sources: ['Government Registry'],
          confidence: 'low',
          error: `No registry API available for ${country}`
        };
      }

      // Simulate government registry API call
      const response = await this.callGovernmentRegistryAPI(apiUrl, {
        fullName,
        dateOfBirth,
        country
      });

      if (response && response.isDeceased) {
        return {
          isVerified: true,
          data: {
            fullName,
            dateOfBirth,
            dateOfDeath: response.dateOfDeath,
            location: response.location || 'Unknown',
            country,
            source: 'Government Registry',
            confidence: 'high',
            verificationId: `${country}-GOV-${Date.now()}`,
            timestamp: new Date().toISOString()
          },
          sources: ['Government Registry'],
          confidence: 'high'
        };
      }

      return {
        isVerified: false,
        data: null,
        sources: ['Government Registry'],
        confidence: 'low'
      };

    } catch (error) {
      console.error('Government registry verification error:', error);
      return {
        isVerified: false,
        data: null,
        sources: ['Government Registry'],
        confidence: 'low',
        error: error instanceof Error ? error.message : 'Government registry API error'
      };
    }
  }

  /**
   * Verify death using news and obituary sources
   */
  private async verifyDeathNews(
    fullName: string,
    location?: string,
    dateOfDeath?: string
  ): Promise<DeathVerificationResult> {
    try {
      const query: NewsQuery = {
        name: fullName,
        location,
        dateRange: dateOfDeath ? {
          start: new Date(new Date(dateOfDeath).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days before
          end: new Date(new Date(dateOfDeath).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()   // 30 days after
        } : undefined
      };

      // Simulate news API calls
      const newsResults = await Promise.allSettled([
        this.callNewsAPI('newsapi', query),
        this.callNewsAPI('obituary', query),
        this.callNewsAPI('legacy', query)
      ]);

      const verifiedNews = newsResults
        .filter((result): result is PromiseFulfilledResult<any> => 
          result.status === 'fulfilled' && result.value.isDeceased
        )
        .map(result => result.value);

      if (verifiedNews.length > 0) {
        const bestMatch = verifiedNews[0]; // Take the first match
        return {
          isVerified: true,
          data: {
            fullName,
            dateOfBirth: 'Unknown',
            dateOfDeath: bestMatch.dateOfDeath,
            location: bestMatch.location || location || 'Unknown',
            country: bestMatch.country || 'Unknown',
            source: 'News',
            confidence: 'medium',
            verificationId: `NEWS-${Date.now()}`,
            timestamp: new Date().toISOString()
          },
          sources: ['News', 'Obituary'],
          confidence: 'medium'
        };
      }

      return {
        isVerified: false,
        data: null,
        sources: ['News', 'Obituary'],
        confidence: 'low'
      };

    } catch (error) {
      console.error('News verification error:', error);
      return {
        isVerified: false,
        data: null,
        sources: ['News', 'Obituary'],
        confidence: 'low',
        error: error instanceof Error ? error.message : 'News API error'
      };
    }
  }

  /**
   * Combine multiple verification results
   */
  private combineVerificationResults(results: DeathVerificationResult[]): DeathVerificationResult {
    if (results.length === 1) {
      return results[0];
    }

    // Multiple sources found - combine them
    const sources = results.flatMap(r => r.sources);
    const highConfidenceResults = results.filter(r => r.confidence === 'high');
    
    let confidence: 'high' | 'medium' | 'low' = 'low';
    if (highConfidenceResults.length >= 2) {
      confidence = 'high';
    } else if (highConfidenceResults.length === 1 || results.length >= 2) {
      confidence = 'medium';
    }

    // Use the highest confidence result as primary data
    const primaryResult = results.sort((a, b) => {
      const confidenceOrder = { high: 3, medium: 2, low: 1 };
      return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
    })[0];

    return {
      isVerified: true,
      data: primaryResult.data,
      sources: [...new Set(sources)], // Remove duplicates
      confidence
    };
  }

  /**
   * Get mock verification for development/testnet
   */
  private getMockVerification(
    fullName: string,
    dateOfBirth: string,
    country: string
  ): DeathVerificationResult {
    // Simple mock logic - in real implementation, you'd have more sophisticated matching
    const mockKey = `${fullName.toLowerCase().replace(' ', '-')}-${Date.now() % 1000}`;
    const mockData = MOCK_DEATH_VERIFICATIONS[mockKey];

    if (mockData && Math.random() > 0.7) { // 30% chance of finding a match
      return {
        isVerified: true,
        data: mockData,
        sources: [mockData.source],
        confidence: mockData.confidence
      };
    }

    return {
      isVerified: false,
      data: null,
      sources: ['Mock Data'],
      confidence: 'low'
    };
  }

  /**
   * Simulate SSDI API call
   */
  private async callSSDIAPI(query: SSDIQuery): Promise<any> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Mock response - in production, this would be a real API call
    if (Math.random() > 0.8) { // 20% chance of finding a match
      return {
        isDeceased: true,
        dateOfDeath: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        location: 'New York, NY',
        ssn: query.ssn
      };
    }
    
    return { isDeceased: false };
  }

  /**
   * Simulate government registry API call
   */
  private async callGovernmentRegistryAPI(apiUrl: string, data: any): Promise<any> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
    
    // Mock response
    if (Math.random() > 0.85) { // 15% chance of finding a match
      return {
        isDeceased: true,
        dateOfDeath: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        location: 'London, UK',
        country: data.country
      };
    }
    
    return { isDeceased: false };
  }

  /**
   * Simulate news API call
   */
  private async callNewsAPI(source: string, query: NewsQuery): Promise<any> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1500));
    
    // Mock response
    if (Math.random() > 0.9) { // 10% chance of finding a match
      return {
        isDeceased: true,
        dateOfDeath: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        location: query.location || 'Unknown',
        country: 'US',
        source
      };
    }
    
    return { isDeceased: false };
  }

  /**
   * Check API health
   */
  async checkApiHealth(): Promise<{ available: boolean; responseTime: number; error?: string }> {
    if (this.config.isDevelopment || this.config.isTestnet) {
      return { available: true, responseTime: 0 };
    }

    const startTime = Date.now();
    try {
      // Test a simple verification
      const result = await this.verifyDeath('Test User', '1990-01-01', 'US');
      const responseTime = Date.now() - startTime;
      
      return {
        available: true,
        responseTime
      };
    } catch (error) {
      return {
        available: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0.75 // Mock hit rate
    };
  }
}

// Export singleton instance
export const deathVerificationApiService = new DeathVerificationApiService(); 