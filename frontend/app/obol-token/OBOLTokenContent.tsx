'use client'

import { useState, useEffect } from 'react';

export default function OBOLTokenContent() {
  // You can reintroduce your real logic here, including hooks, wallet, etc.
  // For now, this is the previous static content.
  return (
    <div className="min-h-screen bg-sarcophagus-950">
      {/* Navigation */}
      <nav className="bg-sarcophagus-900/90 backdrop-blur-sm border-b border-sarcophagus-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <a href="/" className="text-2xl font-bold text-sarcophagus-100">Sarcophagus Protocol</a>
            <a 
              href="/obol-token" 
              className="text-accent-gold px-4 py-2 bg-sarcophagus-800/50 rounded-lg border border-sarcophagus-600"
            >
              $OBOL Token
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-6">⚡</div>
          <h1 className="text-5xl font-bold text-sarcophagus-100 mb-4">
            $OBOL Token
          </h1>
          <p className="text-xl text-sarcophagus-300 mb-8 max-w-3xl mx-auto">
            The reward token of the Sarcophagus Protocol. Earn $OBOL through our hybrid system: 
            instant bonuses on deposits + continuous rewards over time.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-sarcophagus-800/80 backdrop-blur-sm border border-sarcophagus-700 rounded-lg p-6">
              <div className="text-3xl font-bold text-accent-gold">1,000,000,000</div>
              <div className="text-sarcophagus-400">Total Supply</div>
            </div>
            <div className="bg-sarcophagus-800/80 backdrop-blur-sm border border-sarcophagus-700 rounded-lg p-6">
              <div className="text-3xl font-bold text-green-400">152,500,000</div>
              <div className="text-sarcophagus-400">Circulating Supply</div>
            </div>
            <div className="bg-sarcophagus-800/80 backdrop-blur-sm border border-sarcophagus-700 rounded-lg p-6">
              <div className="text-3xl font-bold text-blue-400">$1,525,000</div>
              <div className="text-sarcophagus-400">Market Cap</div>
            </div>
            <div className="bg-sarcophagus-800/80 backdrop-blur-sm border border-sarcophagus-700 rounded-lg p-6">
              <div className="text-3xl font-bold text-accent-gold">730%</div>
              <div className="text-sarcophagus-400">Max APY</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 