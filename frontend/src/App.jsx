import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { BlockchainProvider } from './context/BlockchainContext'
import Navigation from './components/Navigation'
import SwapInterface from './components/SwapInterface'
import Liquidity from './components/Liquidity'
import Dashboard from './components/Dashboard'
import Footer from './components/Footer'
import NetworkStatus from './components/NetworkStatus'
import WalletConnect from './components/WalletConnect'

function App() {
  return (
    // Wrap entire app with BlockchainProvider
    <BlockchainProvider>
      <Router>
        <div className="min-h-screen bg-dark-bg relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-start/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute top-1/3 -right-20 w-60 h-60 bg-gradient-middle/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
            <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-gradient-end/10 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
          </div>

          <div className="relative z-10">
            <Navigation />
            <NetworkStatus />
            
            <main className="container mx-auto px-4 py-8">
                           
              <Routes>
                {/* All pages now share the same blockchain state */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/swap" element={<SwapInterface />} />
                <Route path="/liquidity" element={<Liquidity />} />
              </Routes>
            </main>
            
            <Footer />
          </div>
        </div>
      </Router>
    </BlockchainProvider>
  )
}

export default App