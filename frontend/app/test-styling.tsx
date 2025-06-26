'use client'

import React from 'react'

export default function TestStyling() {
  return (
    <div className="min-h-screen bg-sarcophagus-950 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-sarcophagus-100 text-center">
          Sarcophagus Theme Test
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-sarcophagus-800/80 backdrop-blur-sm border border-sarcophagus-700 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-accent-gold mb-4">Color Test</h2>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-accent-gold rounded"></div>
                <span className="text-sarcophagus-100">Accent Gold</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-accent-bronze rounded"></div>
                <span className="text-sarcophagus-100">Accent Bronze</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-sarcophagus-800 rounded"></div>
                <span className="text-sarcophagus-100">Sarcophagus 800</span>
              </div>
            </div>
          </div>
          
          <div className="bg-sarcophagus-800/80 backdrop-blur-sm border border-sarcophagus-700 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-accent-gold mb-4">Button Test</h2>
            <div className="space-y-4">
              <button className="bg-gradient-to-r from-accent-gold to-accent-bronze text-sarcophagus-950 px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity w-full">
                Primary Button
              </button>
              <button className="bg-sarcophagus-700 text-sarcophagus-100 px-6 py-3 rounded-lg border border-sarcophagus-600 hover:bg-sarcophagus-600 transition-colors w-full">
                Secondary Button
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-sarcophagus-800/80 backdrop-blur-sm border border-sarcophagus-700 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-accent-gold mb-4">Text Colors</h2>
          <div className="space-y-2">
            <p className="text-sarcophagus-100">Primary text (sarcophagus-100)</p>
            <p className="text-sarcophagus-300">Secondary text (sarcophagus-300)</p>
            <p className="text-sarcophagus-400">Muted text (sarcophagus-400)</p>
            <p className="text-accent-gold">Accent text (accent-gold)</p>
          </div>
        </div>
      </div>
    </div>
  )
} 