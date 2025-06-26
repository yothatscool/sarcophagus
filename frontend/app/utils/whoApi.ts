// WHO Global Health Observatory API Integration
// Simplified version for Sarcophagus Protocol

import { getEnvironmentConfig, isWHOApiEnabled } from '../config/environment';

export interface WHOLifeExpectancyData {
  country: string;
  countryCode: string;
  male: number;
  female: number;
  both: number;
  year: number;
  source: string;
  lastUpdated: string;
}

// Static fallback data (current WHO 2023 data)
const STATIC_LIFE_EXPECTANCY_DATA: Record<string, { male: number; female: number }> = {
  'Japan': { male: 81.6, female: 87.7 },
  'Switzerland': { male: 81.0, female: 85.1 },
  'Singapore': { male: 80.7, female: 85.2 },
  'Australia': { male: 80.5, female: 84.5 },
  'Spain': { male: 80.1, female: 85.5 },
  'Italy': { male: 79.7, female: 84.4 },
  'Sweden': { male: 80.7, female: 84.0 },
  'Norway': { male: 80.6, female: 84.3 },
  'Netherlands': { male: 79.8, female: 83.2 },
  'Canada': { male: 79.8, female: 83.9 },
  'United Kingdom': { male: 79.4, female: 83.1 },
  'Germany': { male: 78.9, female: 83.6 },
  'France': { male: 78.4, female: 85.2 },
  'United States': { male: 76.1, female: 81.1 },
  'China': { male: 75.0, female: 79.4 },
  'Brazil': { male: 72.8, female: 79.6 },
  'India': { male: 67.5, female: 70.2 },
  'Russia': { male: 66.5, female: 77.2 },
  'South Africa': { male: 61.5, female: 67.7 },
  'Nigeria': { male: 54.7, female: 55.7 },
  'Afghanistan': { male: 63.7, female: 66.0 },
  'Haiti': { male: 63.2, female: 66.5 },
  'Central African Republic': { male: 53.3, female: 55.9 }
};

// Country name to WHO country code mapping
const COUNTRY_CODE_MAP: Record<string, string> = {
  'Japan': 'JPN',
  'Switzerland': 'CHE',
  'Singapore': 'SGP',
  'Australia': 'AUS',
  'Spain': 'ESP',
  'Italy': 'ITA',
  'Sweden': 'SWE',
  'Norway': 'NOR',
  'Netherlands': 'NLD',
  'Canada': 'CAN',
  'United Kingdom': 'GBR',
  'Germany': 'DEU',
  'France': 'FRA',
  'United States': 'USA',
  'China': 'CHN',
  'Brazil': 'BRA',
  'India': 'IND',
  'Russia': 'RUS',
  'South Africa': 'ZAF',
  'Nigeria': 'NGA',
  'Afghanistan': 'AFG',
  'Haiti': 'HTI',
  'Central African Republic': 'CAF'
};

class WHOApiService {
  private config = getEnvironmentConfig();

  /**
   * Fetch life expectancy data from WHO API
   */
  async fetchLifeExpectancyData(country: string): Promise<WHOLifeExpectancyData | null> {
    // Check if WHO API is enabled for current environment
    if (!isWHOApiEnabled()) {
      console.log(`WHO API: Using static data for ${country} (WHO API disabled in ${this.config.isProduction ? 'production' : this.config.isTestnet ? 'testnet' : 'development'})`);
      return this.getStaticData(country);
    }

    try {
      // Fetch from WHO API
      const data = await this.fetchFromWHOApi(country);
      return data;
    } catch (error) {
      console.error(`WHO API: Error fetching data for ${country}:`, error);
      
      // Fallback to static data
      console.log(`WHO API: Falling back to static data for ${country}`);
      return this.getStaticData(country);
    }
  }

  /**
   * Fetch data from WHO Global Health Observatory API
   */
  private async fetchFromWHOApi(country: string): Promise<WHOLifeExpectancyData | null> {
    const countryCode = COUNTRY_CODE_MAP[country];
    if (!countryCode) {
      throw new Error(`Country code not found for ${country}`);
    }

    const currentYear = new Date().getFullYear();
    const url = `${this.config.whoApiUrl}/Indicator?$filter=IndicatorName eq 'Life expectancy at birth (years)' and SpatialDim eq '${countryCode}' and TimeDim eq ${currentYear}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.whoApiTimeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Sarcophagus-Protocol/2.0'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`WHO API responded with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.value || data.value.length === 0) {
        throw new Error(`No data found for ${country} in ${currentYear}`);
      }

      // Process the data - simplified for now
      const maleData = data.value.find((v: any) => v.Dim1 === 'SEX' && v.Dim1Value === 'MLE');
      const femaleData = data.value.find((v: any) => v.Dim1 === 'SEX' && v.Dim1Value === 'FMLE');
      const bothData = data.value.find((v: any) => v.Dim1 === 'SEX' && v.Dim1Value === 'BTSX');

      return {
        country,
        countryCode,
        male: maleData?.NumericValue || 0,
        female: femaleData?.NumericValue || 0,
        both: bothData?.NumericValue || 0,
        year: currentYear,
        source: 'WHO Global Health Observatory API',
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Get static fallback data
   */
  private getStaticData(country: string): WHOLifeExpectancyData | null {
    const data = STATIC_LIFE_EXPECTANCY_DATA[country];
    if (!data) return null;

    return {
      country,
      countryCode: COUNTRY_CODE_MAP[country] || '',
      male: data.male,
      female: data.female,
      both: (data.male + data.female) / 2,
      year: 2023,
      source: 'WHO 2023 Data (Static)',
      lastUpdated: '2023-12-31T23:59:59.999Z'
    };
  }

  /**
   * Get available countries
   */
  getAvailableCountries(): string[] {
    return Object.keys(STATIC_LIFE_EXPECTANCY_DATA).sort();
  }

  /**
   * Check if WHO API is available
   */
  async checkApiHealth(): Promise<{ available: boolean; responseTime: number; error?: string }> {
    if (!isWHOApiEnabled()) {
      return { available: false, responseTime: 0, error: 'WHO API disabled in current environment' };
    }

    const startTime = Date.now();
    try {
      const response = await fetch(`${this.config.whoApiUrl}/Indicator?$top=1`);
      const responseTime = Date.now() - startTime;
      
      return {
        available: response.ok,
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
   * Get cache statistics (simplified - no caching in this version)
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: 0,
      entries: []
    };
  }

  /**
   * Clear cache (simplified - no caching in this version)
   */
  clearCache(): void {
    // No caching implemented in this simplified version
  }

  /**
   * Get current environment info
   */
  getEnvironmentInfo() {
    return {
      isProduction: this.config.isProduction,
      isTestnet: this.config.isTestnet,
      isDevelopment: this.config.isDevelopment,
      whoApiEnabled: isWHOApiEnabled(),
      whoApiUrl: this.config.whoApiUrl,
      whoApiTimeout: this.config.whoApiTimeout
    };
  }
}

// Export singleton instance
export const whoApiService = new WHOApiService(); 