import React, { useState } from 'react'
import { TrendingUp, Users, DollarSign, Activity, RefreshCw, Bug } from 'lucide-react'
import { useBlockchainContext } from '../context/BlockchainContext'
import { Link } from 'react-router-dom'

function Dashboard() {
  // Use context instead of direct hook
  const { account, balances, reserves, mintTokens, isLoading, txLoading, refreshData } = useBlockchainContext()
  const [mintLoading, setMintLoading] = useState({ TKA: false, TKB: false })
  const [refreshing, setRefreshing] = useState(false)
  
  // Calculate TVL (assuming $1 per token for testnet)
  const calculateTVL = () => {
    const reserveA = parseFloat(reserves.reserveA) || 0
    const reserveB = parseFloat(reserves.reserveB) || 0
    return ((reserveA + reserveB) * 1).toFixed(2)
  }

  // Calculate exchange rate
  const calculateExchangeRate = () => {
    const reserveA = parseFloat(reserves.reserveA) || 0
    const reserveB = parseFloat(reserves.reserveB) || 0
    if (reserveA > 0 && reserveB > 0) {
      return (reserveB / reserveA).toFixed(4)
    }
    return 0
  }

  const stats = [
    { 
      icon: DollarSign, 
      label: 'TVL', 
      value: `$${calculateTVL()}`, 
      change: 'Live' 
    },
    { 
      icon: Users, 
      label: 'Your Balance', 
      value: `${balances.tokenA ? parseFloat(balances.tokenA).toFixed(4) : '0.0000'} TKA`, 
      change: `${balances.tokenB ? parseFloat(balances.tokenB).toFixed(4) : '0.0000'} TKB` 
    },
    { 
      icon: Activity, 
      label: 'Pool Reserves', 
      value: `${reserves.reserveA ? parseFloat(reserves.reserveA).toFixed(4) : '0.0000'} TKA`, 
      change: `${reserves.reserveB ? parseFloat(reserves.reserveB).toFixed(4) : '0.0000'} TKB` 
    },
    { 
      icon: TrendingUp, 
      label: 'Exchange Rate', 
      value: reserves.reserveA > 0 ? `1 TKA = ${calculateExchangeRate()} TKB` : 'N/A', 
      change: 'Live' 
    },
  ]

  const handleMint = async (token) => {
    if (!account) {
      alert('Please connect wallet first')
      return
    }
    
    const amount = prompt(`Enter amount of ${token} to mint:`, '1000')
    if (amount && parseFloat(amount) > 0) {
      setMintLoading(prev => ({ ...prev, [token]: true }))
      try {
        const tx = await mintTokens(token, amount)
        if (tx) {
          alert(`✅ Successfully minted ${amount} ${token}!`)
          // Data will refresh automatically via context
        }
      } catch (error) {
        alert(`❌ Mint failed: ${error.message}`)
      } finally {
        setMintLoading(prev => ({ ...prev, [token]: false }))
      }
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshData() // Use refreshData from context
    setRefreshing(false)
  }

  const runDebug = async () => {
    if (window.debugContracts) {
      await window.debugContracts()
    } else {
      alert('Debug script not loaded. Check console.')
    }
  }

  const quickSetup = async () => {
    if (!account) {
      alert('Please connect wallet first')
      return
    }
    
    if (confirm('This will:\n1. Mint 1000 TKA\n2. Mint 1000 TKB\n\nContinue?')) {
      try {
        // Mint TKA
        alert('Minting 1000 TKA...')
        await mintTokens('TKA', '1000')
        
        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        // Mint TKB
        alert('Minting 1000 TKB...')
        await mintTokens('TKB', '1000')
        
        alert('✅ Setup complete! Now add liquidity from the Liquidity tab.')
        
      } catch (error) {
        alert(`❌ Setup failed: ${error.message}`)
      }
    }
  }

  // Format account address
  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="glass-card mb-8 overflow-hidden">
        <div className="gradient-bg p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Swap Saga AMM</h1>
              <p className="text-xl text-white/90">
                Bidirectional Automated Market Maker on Base Sepolia
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleRefresh}
                disabled={isLoading || refreshing || txLoading}
                className="flex items-center space-x-2 px-4 py-2 glass-card hover:bg-glass-border transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
              </button>
              {/* <button
                onClick={runDebug}
                disabled={txLoading}
                className="flex items-center space-x-2 px-4 py-2 glass-card hover:bg-amber-500/20 transition-colors disabled:opacity-50"
              >
                <Bug className="w-5 h-5" />
                <span>Debug</span>
              </button> */}
            </div>
          </div>
          <div className="flex space-x-4">
            <Link to="/swap" className="glass-card px-6 py-3 font-semibold hover:scale-105 transition-transform block">
              Start Swapping
            </Link>
            <Link to="/liquidity" className="glass-card px-6 py-3 font-semibold hover:scale-105 transition-transform block">
              Add Liquidity
            </Link>
            <button 
              onClick={quickSetup}
              disabled={txLoading}
              className="glass-card px-6 py-3 font-semibold hover:scale-105 transition-transform bg-emerald-500/20 hover:bg-emerald-500/30 disabled:opacity-50"
            >
              {txLoading ? 'Processing...' : 'Quick Setup'}
            </button>
          </div>
        </div>
      </div>

      {/* Wallet Status */}
      {account ? (
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold gradient-text">Wallet Connected</h3>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-gray-400 text-sm mt-1">{formatAddress(account)}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold mb-2">Your Balances</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between min-w-40">
                  <span className="text-gray-300">TKA:</span>
                  <span className="font-bold gradient-text">
                    {isLoading ? '...' : (balances.tokenA ? parseFloat(balances.tokenA).toFixed(4) : '0.0000')}
                  </span>
                </div>
                <div className="flex items-center justify-between min-w-40">
                  <span className="text-gray-300">TKB:</span>
                  <span className="font-bold gradient-text">
                    {isLoading ? '...' : (balances.tokenB ? parseFloat(balances.tokenB).toFixed(4) : '0.0000')}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => handleMint('TKA')}
                disabled={isLoading || mintLoading.TKA || txLoading}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 min-w-24 flex items-center justify-center"
              >
                {mintLoading.TKA ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Mint TKA'
                )}
              </button>
              <button 
                onClick={() => handleMint('TKB')}
                disabled={isLoading || mintLoading.TKB || txLoading}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 min-w-24 flex items-center justify-center"
              >
                {mintLoading.TKB ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Mint TKB'
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-6 mb-8 text-center">
          <h3 className="text-xl font-bold gradient-text mb-2">Connect Your Wallet</h3>
          <p className="text-gray-400">Connect to Base Sepolia to start swapping tokens</p>
          <p className="text-sm text-gray-500 mt-2">Need test ETH? Use the Base Sepolia faucet</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="glass-card p-6 glow-effect">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold mt-2">
                  {isLoading ? '...' : stat.value}
                </p>
              </div>
              <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-emerald-400 text-sm font-medium">
                {stat.change}
              </span>
              {stat.label === 'Your Balance' && (
                <span className="text-gray-400 text-sm ml-2">/ {stat.change}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pool Info */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-4 gradient-text">Liquidity Pool</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">TKA Reserve</span>
                <span className="font-medium">
                  {isLoading ? '...' : (reserves.reserveA ? parseFloat(reserves.reserveA).toFixed(4) : '0.0000')} TKA
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full gradient-bg"
                  style={{ 
                    width: reserves.reserveA > 0 && reserves.reserveB > 0 
                      ? `${(parseFloat(reserves.reserveA) / (parseFloat(reserves.reserveA) + parseFloat(reserves.reserveB))) * 100}%` 
                      : '50%' 
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">TKB Reserve</span>
                <span className="font-medium">
                  {isLoading ? '...' : (reserves.reserveB ? parseFloat(reserves.reserveB).toFixed(4) : '0.0000')} TKB
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full gradient-bg"
                  style={{ 
                    width: reserves.reserveA > 0 && reserves.reserveB > 0 
                      ? `${(parseFloat(reserves.reserveB) / (parseFloat(reserves.reserveA) + parseFloat(reserves.reserveB))) * 100}%` 
                      : '50%' 
                  }}
                ></div>
              </div>
            </div>
            <div className="pt-4 border-t border-glass-border">
              <div className="flex justify-between">
                <span className="text-gray-400">Pool Value (Estimated)</span>
                <span className="font-bold gradient-text">
                  {isLoading ? '...' : `$${calculateTVL()}`}
                </span>
              </div>
            </div>
            <Link 
              to="/liquidity"
              className="w-full glass-card py-3 font-semibold hover:scale-105 transition-transform block text-center"
            >
              Manage Liquidity
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-4 gradient-text">Quick Actions</h3>
          <div className="space-y-4">
            <Link 
              to="/swap" 
              className="block p-4 glass-card hover:bg-glass-border transition-all duration-300 rounded-xl group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Swap Tokens</h4>
                  <p className="text-sm text-gray-400">
                    Exchange TKA for TKB and vice versa
                  </p>
                </div>
                <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
                  <span className="font-bold">🔄</span>
                </div>
              </div>
            </Link>
            
            <Link 
              to="/liquidity" 
              className="block p-4 glass-card hover:bg-glass-border transition-all duration-300 rounded-xl group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Add Liquidity</h4>
                  <p className="text-sm text-gray-400">
                    Provide liquidity and earn fees
                  </p>
                </div>
                <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
                  <span className="font-bold">💧</span>
                </div>
              </div>
            </Link>
            
            <div className="p-4 glass-card rounded-xl">
              <h4 className="font-semibold mb-2">Network Info</h4>
              <div className="space-y-1 text-sm">
                <p className="text-gray-400">Chain: <span className="text-emerald-400">Base Sepolia (Testnet)</span></p>
                <p className="text-gray-400">Chain ID: <span className="text-emerald-400">84532</span></p>
                <p className="mt-3">
                  <a 
                    href="https://faucet.quicknode.com/base/sepolia" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    🔗 Get test ETH from faucet
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard