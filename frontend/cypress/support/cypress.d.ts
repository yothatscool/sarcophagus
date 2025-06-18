/// <reference types="cypress" />

import { Connex } from '@vechain/connex';

declare global {
  namespace Cypress {
    interface AUTWindow {
      connex: Connex;
    }
  }
} 