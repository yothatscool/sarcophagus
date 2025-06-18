import { Connex } from '@vechain/connex';

declare global {
  interface Window {
    connex?: Connex;
  }
}

export {}; 