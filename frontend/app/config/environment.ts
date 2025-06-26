// Environment Configuration
// Manages different settings for development, testnet, and mainnet

export interface EnvironmentConfig {
  isProduction: boolean;
  isTestnet: boolean;
  isDevelopment: boolean;
  whoApiEnabled: boolean;
  whoApiUrl: string;
  whoApiTimeout: number;
  enableCaching: boolean;
  cacheDuration: number;
  fallbackToStatic: boolean;
}

// Development environment (localhost)
const developmentConfig: EnvironmentConfig = {
  isProduction: false,
  isTestnet: false,
  isDevelopment: true,
  whoApiEnabled: false, // Use static data in development
  whoApiUrl: 'https://ghoapi.azureedge.net/api',
  whoApiTimeout: 5000,
  enableCaching: false,
  cacheDuration: 0,
  fallbackToStatic: true
};

// Testnet environment
const testnetConfig: EnvironmentConfig = {
  isProduction: false,
  isTestnet: true,
  isDevelopment: false,
  whoApiEnabled: false, // Use static data in testnet
  whoApiUrl: 'https://ghoapi.azureedge.net/api',
  whoApiTimeout: 5000,
  enableCaching: false,
  cacheDuration: 0,
  fallbackToStatic: true
};

// Production environment (mainnet)
const productionConfig: EnvironmentConfig = {
  isProduction: true,
  isTestnet: false,
  isDevelopment: false,
  whoApiEnabled: true, // Use real WHO API in production
  whoApiUrl: 'https://ghoapi.azureedge.net/api',
  whoApiTimeout: 10000,
  enableCaching: true,
  cacheDuration: 24 * 60 * 60 * 1000, // 24 hours
  fallbackToStatic: true
};

// Get current environment configuration
export function getEnvironmentConfig(): EnvironmentConfig {
  const nodeEnv = process.env.NODE_ENV;
  
  switch (nodeEnv) {
    case 'production':
      return productionConfig;
    case 'test':
      return testnetConfig;
    case 'development':
    default:
      return developmentConfig;
  }
}

// Helper functions
export const isProduction = () => getEnvironmentConfig().isProduction;
export const isTestnet = () => getEnvironmentConfig().isTestnet;
export const isDevelopment = () => getEnvironmentConfig().isDevelopment;

// WHO API specific helpers
export const isWHOApiEnabled = () => getEnvironmentConfig().whoApiEnabled;
export const getWHOApiUrl = () => getEnvironmentConfig().whoApiUrl;
export const getWHOApiTimeout = () => getEnvironmentConfig().whoApiTimeout;
export const isCachingEnabled = () => getEnvironmentConfig().enableCaching;
export const getCacheDuration = () => getEnvironmentConfig().cacheDuration;
export const isFallbackEnabled = () => getEnvironmentConfig().fallbackToStatic;

// Environment-specific messaging
export const getEnvironmentMessage = () => {
  const config = getEnvironmentConfig();
  
  if (config.isProduction) {
    return {
      title: 'Production Mode',
      description: 'Using real WHO API data for life expectancy calculations',
      dataSource: 'WHO Global Health Observatory API'
    };
  } else if (config.isTestnet) {
    return {
      title: 'Testnet Mode',
      description: 'Using WHO 2023 static data for testing',
      dataSource: 'WHO 2023 Data (Static)'
    };
  } else {
    return {
      title: 'Development Mode',
      description: 'Using WHO 2023 static data for development',
      dataSource: 'WHO 2023 Data (Static)'
    };
  }
};

// Feature flags
export const getFeatureFlags = () => {
  const config = getEnvironmentConfig();
  
  return {
    whoApiIntegration: config.whoApiEnabled,
    realTimeData: config.whoApiEnabled,
    caching: config.enableCaching,
    fallbackData: config.fallbackToStatic,
    advancedAnalytics: config.isProduction,
    debugMode: config.isDevelopment
  };
}; 