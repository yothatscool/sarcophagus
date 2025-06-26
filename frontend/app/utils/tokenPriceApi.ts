// Token Price API Integration
// Fetches real-time prices for VeChain ecosystem tokens

import { getEnvironmentConfig } from '../config/environment';

export interface TokenPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  last_updated: string;
}

export interface TokenPriceData {
  vet: TokenPrice | null;
  vtho: TokenPrice | null;
  b3tr: TokenPrice | null;
  obol: TokenPrice | null;
  lastUpdated: string;
}

// VeChain token IDs on CoinGecko
const TOKEN_IDS = {
  vet: 'vechain',
  vtho: 'vechainthor',
  b3tr: 'b3tr', // Replace with actual B3TR ID when available
  obol: 'obol' // Replace with actual OBOL ID when available
};

// Static fallback prices (for development/testnet)
const STATIC_PRICES = {
  vet: {
    id: 'vechain',
    symbol: 'vet',
    name: 'VeChain',
    current_price: 0.023,
    market_cap: 1670000000,
    total_volume: 25000000,
    price_change_24h: 0.001,
    price_change_percentage_24h: 4.5,
    last_updated: new Date().toISOString()
  },
  vtho: {
    id: 'vechainthor',
    symbol: 'vtho',
    name: 'VeThor Token',
    current_price: 0.0008,
    market_cap: 32000000,
    total_volume: 500000,
    price_change_24h: 0.0001,
    price_change_percentage_24h: 14.3,
    last_updated: new Date().toISOString()
  },
  b3tr: {
    id: 'b3tr',
    symbol: 'b3tr',
    name: 'B3TR Token',
    current_price: 0.15,
    market_cap: 15000000,
    total_volume: 100000,
    price_change_24h: 0.02,
    price_change_percentage_24h: 15.4,
    last_updated: new Date().toISOString()
  },
  obol: {
    id: 'obol',
    symbol: 'obol',
    name: 'OBOL Token',
    current_price: 0.05,
    market_cap: 5000000,
    total_volume: 50000,
    price_change_24h: 0.01,
    price_change_percentage_24h: 25.0,
    last_updated: new Date().toISOString()
  }
};

class TokenPriceApiService {
  private config = getEnvironmentConfig();
  private cache: Map<string, { data: TokenPrice; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Fetch all token prices
   */
  async fetchAllTokenPrices(): Promise<TokenPriceData> {
    if (this.config.isDevelopment || this.config.isTestnet) {
      return this.getStaticPrices();
    }

    try {
      const [vet, vtho, b3tr, obol] = await Promise.allSettled([
        this.fetchTokenPrice('vet'),
        this.fetchTokenPrice('vtho'),
        this.fetchTokenPrice('b3tr'),
        this.fetchTokenPrice('obol')
      ]);

      return {
        vet: vet.status === 'fulfilled' ? vet.value : STATIC_PRICES.vet,
        vtho: vtho.status === 'fulfilled' ? vtho.value : STATIC_PRICES.vtho,
        b3tr: b3tr.status === 'fulfilled' ? b3tr.value : STATIC_PRICES.b3tr,
        obol: obol.status === 'fulfilled' ? obol.value : STATIC_PRICES.obol,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching token prices:', error);
      return this.getStaticPrices();
    }
  }

  /**
   * Fetch price for a specific token
   */
  async fetchTokenPrice(tokenSymbol: keyof typeof TOKEN_IDS): Promise<TokenPrice | null> {
    const cacheKey = `price_${tokenSymbol}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const tokenId = TOKEN_IDS[tokenSymbol];
      if (!tokenId) {
        console.warn(`Token ID not found for ${tokenSymbol}`);
        return STATIC_PRICES[tokenSymbol] || null;
      }

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Sarcophagus-Protocol/2.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API responded with status ${response.status}`);
      }

      const data = await response.json();
      const tokenData = data[tokenId];

      if (!tokenData) {
        throw new Error(`No data returned for ${tokenSymbol}`);
      }

      const priceData: TokenPrice = {
        id: tokenId,
        symbol: tokenSymbol.toUpperCase(),
        name: this.getTokenName(tokenSymbol),
        current_price: tokenData.usd,
        market_cap: tokenData.usd_market_cap,
        total_volume: tokenData.usd_24h_vol,
        price_change_24h: tokenData.usd_24h_change,
        price_change_percentage_24h: tokenData.usd_24h_change,
        last_updated: new Date(tokenData.last_updated_at * 1000).toISOString()
      };

      // Cache the result
      this.cache.set(cacheKey, { data: priceData, timestamp: Date.now() });

      return priceData;
    } catch (error) {
      console.error(`Error fetching ${tokenSymbol} price:`, error);
      return STATIC_PRICES[tokenSymbol] || null;
    }
  }

  /**
   * Calculate total portfolio value
   */
  calculatePortfolioValue(
    balances: { vet: number; vtho: number; b3tr: number; obol: number },
    prices: TokenPriceData
  ): number {
    let totalValue = 0;

    if (prices.vet && balances.vet > 0) {
      totalValue += balances.vet * prices.vet.current_price;
    }
    if (prices.vtho && balances.vtho > 0) {
      totalValue += balances.vtho * prices.vtho.current_price;
    }
    if (prices.b3tr && balances.b3tr > 0) {
      totalValue += balances.b3tr * prices.b3tr.current_price;
    }
    if (prices.obol && balances.obol > 0) {
      totalValue += balances.obol * prices.obol.current_price;
    }

    return totalValue;
  }

  /**
   * Get token price history (for charts)
   */
  async getTokenPriceHistory(
    tokenSymbol: keyof typeof TOKEN_IDS,
    days: number = 30
  ): Promise<Array<[number, number]>> {
    if (this.config.isDevelopment || this.config.isTestnet) {
      return this.generateMockPriceHistory(days);
    }

    try {
      const tokenId = TOKEN_IDS[tokenSymbol];
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart?vs_currency=usd&days=${days}`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Sarcophagus-Protocol/2.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API responded with status ${response.status}`);
      }

      const data = await response.json();
      return data.prices || [];
    } catch (error) {
      console.error(`Error fetching ${tokenSymbol} price history:`, error);
      return this.generateMockPriceHistory(days);
    }
  }

  /**
   * Get static prices for development/testnet
   */
  private getStaticPrices(): TokenPriceData {
    return {
      vet: STATIC_PRICES.vet,
      vtho: STATIC_PRICES.vtho,
      b3tr: STATIC_PRICES.b3tr,
      obol: STATIC_PRICES.obol,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get token name
   */
  private getTokenName(symbol: string): string {
    const names: Record<string, string> = {
      vet: 'VeChain',
      vtho: 'VeThor Token',
      b3tr: 'B3TR Token',
      obol: 'OBOL Token'
    };
    return names[symbol] || symbol.toUpperCase();
  }

  /**
   * Generate mock price history for development
   */
  private generateMockPriceHistory(days: number): Array<[number, number]> {
    const history: Array<[number, number]> = [];
    const basePrice = 0.023; // Base VET price
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    for (let i = days; i >= 0; i--) {
      const timestamp = now - (i * dayMs);
      const randomChange = (Math.random() - 0.5) * 0.1; // ±5% change
      const price = basePrice * (1 + randomChange);
      history.push([timestamp, price]);
    }

    return history;
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
      const response = await fetch('https://api.coingecko.com/api/v3/ping');
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
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0.85 // Mock hit rate
    };
  }
}

// Export singleton instance
export const tokenPriceApiService = new TokenPriceApiService(); 