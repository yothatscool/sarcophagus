'use client'

import React from 'react';

export default function TestDashboardContent() {
  // You can reintroduce your real logic here, including hooks, wallet, etc.
  // For now, this is the previous static content.
  return (
    <div className="min-h-screen bg-sarcophagus-950">
      {/* Navigation */}
      <nav className="bg-sarcophagus-900/90 backdrop-blur-sm border-b border-sarcophagus-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-sarcophagus-100">Sarcophagus Protocol</h1>
            <a 
              href="/" 
              className="text-accent-gold hover:text-accent-bronze transition-colors px-4 py-2 bg-sarcophagus-800/50 rounded-lg hover:bg-sarcophagus-800/80 border border-sarcophagus-600"
            >
              ← Back to Main
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="text-6xl mb-6">⚰️</div>
          <h2 className="text-4xl font-bold text-sarcophagus-100 mb-4">
            Professional Dark Theme Test
          </h2>
          <p className="text-xl text-sarcophagus-300 mb-8 max-w-2xl mx-auto">
            This page demonstrates the new sarcophagus-inspired professional dark theme.
          </p>
        </div>

        {/* Color Palette Demo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-sarcophagus-800/80 backdrop-blur-sm border border-sarcophagus-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-accent-gold mb-3">Primary Button</h3>
            <button className="bg-gradient-to-r from-accent-gold to-accent-bronze text-sarcophagus-950 px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity w-full">
              Connect Wallet
            </button>
          </div>
          
          <div className="bg-sarcophagus-800/80 backdrop-blur-sm border border-sarcophagus-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-accent-gold mb-3">Secondary Button</h3>
            <button className="bg-sarcophagus-700 text-sarcophagus-100 px-6 py-3 rounded-lg border border-sarcophagus-600 hover:bg-sarcophagus-600 transition-colors w-full">
              Manage Vault
            </button>
          </div>
          
          <div className="bg-sarcophagus-800/80 backdrop-blur-sm border border-sarcophagus-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-accent-gold mb-3">Ghost Button</h3>
            <button className="bg-transparent text-sarcophagus-300 px-6 py-3 rounded-lg border border-sarcophagus-600 hover:bg-sarcophagus-800 hover:text-sarcophagus-100 transition-colors w-full">
              View Details
            </button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-sarcophagus-800/80 backdrop-blur-sm border border-sarcophagus-700 rounded-lg p-6 text-center">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-lg font-semibold text-accent-gold mb-2">Active</h3>
            <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-green-900/30 text-green-400">
              ACTIVE
            </span>
          </div>
          
          <div className="bg-sarcophagus-800/80 backdrop-blur-sm border border-sarcophagus-700 rounded-lg p-6 text-center">
            <div className="text-3xl mb-3">⏳</div>
            <h3 className="text-lg font-semibold text-accent-gold mb-2">Pending</h3>
            <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-accent-gold/20 text-accent-gold">
              PENDING
            </span>
          </div>
          
          <div className="bg-sarcophagus-800/80 backdrop-blur-sm border border-sarcophagus-700 rounded-lg p-6 text-center">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="text-lg font-semibold text-accent-gold mb-2">Distributed</h3>
            <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-blue-900/30 text-blue-400">
              DISTRIBUTED
            </span>
          </div>
        </div>
      </main>
    </div>
  );
} 