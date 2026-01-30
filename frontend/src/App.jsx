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

import PixelBlast from '@/components/PixelBlast'

function App() {
  return (
    <BlockchainProvider>
      <Router>
        <div className="min-h-screen relative overflow-hidden">

          {/* ================= PIXELBLAST BACKGROUND ================= */}
          <div className="fixed inset-0 z-0 pointer-events-none">
            <PixelBlast
              variant="square"
              pixelSize={6}
              color="#AEB6FF"
              patternScale={1.4}
              patternDensity={0.55}
              pixelSizeJitter={0}

              enableRipples={false}
              liquid={false}

              speed={0.25}
              edgeFade={0.55}
              transparent
            />
          </div>

          {/* Soft neutral overlay for glass readability */}
          <div className="fixed inset-0 z-[1] bg-black/20 backdrop-blur-[4px]" />

          {/* ================= APP CONTENT ================= */}
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navigation />
            <NetworkStatus />
          

            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
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
