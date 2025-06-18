'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationContextType {
  showNotification: (message: string, type: NotificationType) => void;
  showTransactionNotification: (txHash: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const showNotification = useCallback((message: string, type: NotificationType) => {
    toast[type](message, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }, []);

  const showTransactionNotification = useCallback((txHash: string) => {
    toast.info(
      <div>
        <p>Transaction submitted</p>
        <a
          href={`https://testnet.vechain.org/transaction/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700"
        >
          View on VeChain Explorer
        </a>
      </div>,
      {
        position: 'bottom-right',
        autoClose: false,
        closeOnClick: false,
      }
    );
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, showTransactionNotification }}>
      {children}
      <ToastContainer />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
} 