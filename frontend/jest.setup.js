import '@testing-library/jest-dom';
import 'jest-environment-jsdom';

// Mock window.ethereum
global.ethereum = {
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
};

// Mock Connex
class MockConnex {
  thor = {
    account: jest.fn(),
    block: jest.fn(),
    filter: jest.fn(),
    transaction: jest.fn(),
  };
  vendor = {
    sign: jest.fn(),
  };
}

global.connex = new MockConnex();

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
}); 