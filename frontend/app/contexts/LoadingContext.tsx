'use client';

import React, { createContext, useContext, useState } from 'react';

interface LoadingState {
  isLoading: boolean;
  progress?: number; // 0-100
  step?: string;
  message?: string;
  startTime?: number;
  estimatedTime?: number; // in milliseconds
}

interface LoadingContextType {
  loadingStates: { [key: string]: LoadingState };
  setLoading: (key: string, value: boolean, options?: Partial<LoadingState>) => void;
  setProgress: (key: string, progress: number, message?: string) => void;
  setStep: (key: string, step: string, message?: string) => void;
  clearLoading: (key: string) => void;
  getLoadingState: (key: string) => LoadingState | undefined;
  isAnyLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: LoadingState }>({});

  const setLoading = (key: string, value: boolean, options: Partial<LoadingState> = {}) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: {
        isLoading: value,
        progress: value ? 0 : undefined,
        step: value ? 'Initializing...' : undefined,
        message: value ? 'Starting operation...' : undefined,
        startTime: value ? Date.now() : undefined,
        estimatedTime: options.estimatedTime,
        ...options
      }
    }));
  };

  const setProgress = (key: string, progress: number, message?: string) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        progress: Math.min(100, Math.max(0, progress)),
        message: message || prev[key]?.message
      }
    }));
  };

  const setStep = (key: string, step: string, message?: string) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        step,
        message: message || step
      }
    }));
  };

  const clearLoading = (key: string) => {
    setLoadingStates((prev) => {
      const newStates = { ...prev };
      delete newStates[key];
      return newStates;
    });
  };

  const getLoadingState = (key: string) => {
    return loadingStates[key];
  };

  const isAnyLoading = Object.values(loadingStates).some(state => state.isLoading);

  return (
    <LoadingContext.Provider value={{ 
      loadingStates, 
      setLoading, 
      setProgress, 
      setStep, 
      clearLoading, 
      getLoadingState,
      isAnyLoading 
    }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
} 