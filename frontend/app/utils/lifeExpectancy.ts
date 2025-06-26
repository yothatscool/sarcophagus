// Life Expectancy Calculation System
// Based on WHO data and actuarial tables
// Now with real WHO API integration for mainnet

import { whoApiService, WHOLifeExpectancyData } from './whoApi';
import { isWHOApiEnabled, getEnvironmentMessage } from '../config/environment';

export interface LifeExpectancyFactors {
  country: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  smokingStatus: 'never' | 'former' | 'current';
  exerciseLevel: 'sedentary' | 'moderate' | 'active';
  bmi: number;
  education: 'low' | 'medium' | 'high';
  income: 'low' | 'medium' | 'high';
}

export interface LifeExpectancyResult {
  baseLifeExpectancy: number;
  adjustedLifeExpectancy: number;
  factors: {
    country: number;
    smoking: number;
    exercise: number;
    bmi: number;
    education: number;
    income: number;
  };
  confidence: 'high' | 'medium' | 'low';
  source: string;
  dataSource: 'WHO API' | 'Static Data';
  lastUpdated: string;
}

// Static fallback data (current WHO 2023 data) - used for development/testnet
const STATIC_COUNTRY_LIFE_EXPECTANCY: Record<string, { male: number; female: number }> = {
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

// Adjustment factors based on lifestyle and health
const ADJUSTMENT_FACTORS = {
  smoking: {
    never: 0,
    former: -2,
    current: -8
  },
  exercise: {
    sedentary: -3,
    moderate: 0,
    active: +2
  },
  bmi: {
    underweight: -2,
    normal: 0,
    overweight: -1,
    obese: -3
  },
  education: {
    low: -2,
    medium: 0,
    high: +1
  },
  income: {
    low: -3,
    medium: 0,
    high: +1
  }
};

export async function calculateLifeExpectancy(factors: LifeExpectancyFactors): Promise<LifeExpectancyResult> {
  let baseLifeExpectancy: number;
  let dataSource: 'WHO API' | 'Static Data';
  let lastUpdated: string;

  // Try to fetch from WHO API first (if enabled)
  if (isWHOApiEnabled()) {
    try {
      const whoData = await whoApiService.fetchLifeExpectancyData(factors.country);
      if (whoData) {
        baseLifeExpectancy = factors.gender === 'female' ? whoData.female : whoData.male;
        dataSource = 'WHO API';
        lastUpdated = whoData.lastUpdated;
        console.log(`Using WHO API data for ${factors.country}: ${baseLifeExpectancy} years`);
      } else {
        throw new Error('No WHO API data available');
      }
    } catch (error) {
      console.warn(`WHO API failed for ${factors.country}, falling back to static data:`, error);
      // Fallback to static data
      const staticData = STATIC_COUNTRY_LIFE_EXPECTANCY[factors.country];
      if (!staticData) {
        throw new Error(`Life expectancy data not available for ${factors.country}`);
      }
      baseLifeExpectancy = factors.gender === 'female' ? staticData.female : staticData.male;
      dataSource = 'Static Data';
      lastUpdated = '2023-12-31T23:59:59.999Z';
    }
  } else {
    // WHO API disabled: use static data
    const staticData = STATIC_COUNTRY_LIFE_EXPECTANCY[factors.country];
    if (!staticData) {
      throw new Error(`Life expectancy data not available for ${factors.country}`);
    }
    baseLifeExpectancy = factors.gender === 'female' ? staticData.female : staticData.male;
    dataSource = 'Static Data';
    lastUpdated = '2023-12-31T23:59:59.999Z';
  }

  // Calculate BMI category
  const bmiCategory = getBMICategory(factors.bmi);
  
  // Apply adjustments
  const smokingAdjustment = ADJUSTMENT_FACTORS.smoking[factors.smokingStatus];
  const exerciseAdjustment = ADJUSTMENT_FACTORS.exercise[factors.exerciseLevel];
  const bmiAdjustment = ADJUSTMENT_FACTORS.bmi[bmiCategory];
  const educationAdjustment = ADJUSTMENT_FACTORS.education[factors.education];
  const incomeAdjustment = ADJUSTMENT_FACTORS.income[factors.income];

  // Calculate total adjustment
  const totalAdjustment = smokingAdjustment + exerciseAdjustment + bmiAdjustment + 
                         educationAdjustment + incomeAdjustment;

  // Apply age-specific adjustments (older people have different risk factors)
  const ageAdjustment = calculateAgeAdjustment(factors.age, totalAdjustment);
  
  const adjustedLifeExpectancy = Math.max(50, baseLifeExpectancy + ageAdjustment);

  // Determine confidence level
  const confidence = determineConfidence(factors);

  // Get environment message for source
  const envMessage = getEnvironmentMessage();

  return {
    baseLifeExpectancy: Math.round(baseLifeExpectancy * 10) / 10,
    adjustedLifeExpectancy: Math.round(adjustedLifeExpectancy * 10) / 10,
    factors: {
      country: Math.round(baseLifeExpectancy * 10) / 10,
      smoking: smokingAdjustment,
      exercise: exerciseAdjustment,
      bmi: bmiAdjustment,
      education: educationAdjustment,
      income: incomeAdjustment
    },
    confidence,
    source: dataSource === 'WHO API' ? `${envMessage.dataSource} + Actuarial Adjustments` : `${envMessage.dataSource} + Actuarial Adjustments`,
    dataSource,
    lastUpdated
  };
}

// Synchronous version for backward compatibility (uses static data)
export function calculateLifeExpectancySync(factors: LifeExpectancyFactors): LifeExpectancyResult {
  const staticData = STATIC_COUNTRY_LIFE_EXPECTANCY[factors.country];
  if (!staticData) {
    throw new Error(`Life expectancy data not available for ${factors.country}`);
  }

  const baseLifeExpectancy = factors.gender === 'female' ? staticData.female : staticData.male;

  // Calculate BMI category
  const bmiCategory = getBMICategory(factors.bmi);
  
  // Apply adjustments
  const smokingAdjustment = ADJUSTMENT_FACTORS.smoking[factors.smokingStatus];
  const exerciseAdjustment = ADJUSTMENT_FACTORS.exercise[factors.exerciseLevel];
  const bmiAdjustment = ADJUSTMENT_FACTORS.bmi[bmiCategory];
  const educationAdjustment = ADJUSTMENT_FACTORS.education[factors.education];
  const incomeAdjustment = ADJUSTMENT_FACTORS.income[factors.income];

  // Calculate total adjustment
  const totalAdjustment = smokingAdjustment + exerciseAdjustment + bmiAdjustment + 
                         educationAdjustment + incomeAdjustment;

  // Apply age-specific adjustments
  const ageAdjustment = calculateAgeAdjustment(factors.age, totalAdjustment);
  
  const adjustedLifeExpectancy = Math.max(50, baseLifeExpectancy + ageAdjustment);

  // Determine confidence level
  const confidence = determineConfidence(factors);

  return {
    baseLifeExpectancy: Math.round(baseLifeExpectancy * 10) / 10,
    adjustedLifeExpectancy: Math.round(adjustedLifeExpectancy * 10) / 10,
    factors: {
      country: Math.round(baseLifeExpectancy * 10) / 10,
      smoking: smokingAdjustment,
      exercise: exerciseAdjustment,
      bmi: bmiAdjustment,
      education: educationAdjustment,
      income: incomeAdjustment
    },
    confidence,
    source: 'WHO 2023 Data + Actuarial Adjustments',
    dataSource: 'Static Data',
    lastUpdated: '2023-12-31T23:59:59.999Z'
  };
}

function getBMICategory(bmi: number): 'underweight' | 'normal' | 'overweight' | 'obese' {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

function calculateAgeAdjustment(age: number, baseAdjustment: number): number {
  // Younger people get more impact from lifestyle factors
  // Older people have already survived many risks
  if (age < 30) return baseAdjustment * 1.2;
  if (age < 50) return baseAdjustment * 1.0;
  if (age < 70) return baseAdjustment * 0.8;
  return baseAdjustment * 0.6;
}

function determineConfidence(factors: LifeExpectancyFactors): 'high' | 'medium' | 'low' {
  let score = 0;
  
  // More data = higher confidence
  if (factors.country && factors.age && factors.gender) score += 3;
  if (factors.smokingStatus) score += 1;
  if (factors.exerciseLevel) score += 1;
  if (factors.bmi > 0) score += 1;
  if (factors.education) score += 1;
  if (factors.income) score += 1;

  if (score >= 6) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

// Get available countries (now from WHO API service)
export function getAvailableCountries(): string[] {
  return whoApiService.getAvailableCountries();
}

// Get country data for display
export async function getCountryData(country: string) {
  if (process.env.NODE_ENV === 'production') {
    try {
      const whoData = await whoApiService.fetchLifeExpectancyData(country);
      if (whoData) {
        return {
          male: whoData.male,
          female: whoData.female,
          average: Math.round((whoData.male + whoData.female) / 2 * 10) / 10,
          source: 'WHO API',
          lastUpdated: whoData.lastUpdated
        };
      }
    } catch (error) {
      console.warn(`WHO API failed for ${country}, using static data`);
    }
  }
  
  // Fallback to static data
  const data = STATIC_COUNTRY_LIFE_EXPECTANCY[country];
  if (!data) return null;
  
  return {
    male: data.male,
    female: data.female,
    average: Math.round((data.male + data.female) / 2 * 10) / 10,
    source: 'Static Data',
    lastUpdated: '2023-12-31T23:59:59.999Z'
  };
}

// Validate factors
export function validateFactors(factors: Partial<LifeExpectancyFactors>): string[] {
  const errors: string[] = [];
  
  if (!factors.country) errors.push('Country is required');
  if (!factors.age || factors.age < 18 || factors.age > 120) errors.push('Valid age (18-120) is required');
  if (!factors.gender) errors.push('Gender is required');
  if (factors.bmi && (factors.bmi < 10 || factors.bmi > 60)) errors.push('BMI must be between 10-60');
  
  return errors;
}

// Calculate personalized carbon footprint based on user characteristics
export const calculateCarbonFootprint = (factors: LifeExpectancyFactors): number => {
  let baseFootprint = 4.7; // Global average in tons CO2/year
  
  // Adjust for gender (males typically have higher footprints)
  if (factors.gender === 'male') {
    baseFootprint *= 1.15; // ~15% higher for males
  } else if (factors.gender === 'female') {
    baseFootprint *= 0.85; // ~15% lower for females
  }
  
  // Adjust for country/region (developed vs developing)
  const countryMultipliers: { [key: string]: number } = {
    'US': 1.8,      // High consumption
    'Canada': 1.6,  // High consumption
    'UK': 1.2,      // Medium-high
    'Germany': 1.3, // Medium-high
    'France': 1.1,  // Medium
    'Japan': 1.0,   // Medium
    'China': 0.8,   // Medium-low
    'India': 0.4,   // Low
    'Brazil': 0.6,  // Medium-low
    'Nigeria': 0.3, // Low
    'Kenya': 0.2,   // Very low
    'Ethiopia': 0.1 // Very low
  };
  
  if (factors.country && countryMultipliers[factors.country]) {
    baseFootprint *= countryMultipliers[factors.country];
  }
  
  // Adjust for age group
  if (factors.age < 25) {
    baseFootprint *= 0.9; // Younger people typically have lower footprints
  } else if (factors.age > 65) {
    baseFootprint *= 0.8; // Older people typically have lower footprints
  }
  
  // Adjust for lifestyle factors (if available)
  if (factors.smokingStatus === 'current') {
    baseFootprint *= 1.05; // Slight increase for smoking
  }
  
  if (factors.exerciseLevel === 'active') {
    baseFootprint *= 1.1; // Higher activity can mean higher consumption
  } else if (factors.exerciseLevel === 'sedentary') {
    baseFootprint *= 0.95; // Lower activity can mean lower consumption
  }
  
  return Math.round(baseFootprint * 100) / 100; // Round to 2 decimal places
};

// Check WHO API health
export async function checkWHOApiHealth() {
  return await whoApiService.checkApiHealth();
}

// Get WHO API cache statistics
export function getWHOApiCacheStats() {
  return whoApiService.getCacheStats();
}

// Clear WHO API cache
export function clearWHOApiCache() {
  whoApiService.clearCache();
} 