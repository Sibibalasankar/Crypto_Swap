import React, { useState } from 'react'
import { TrendingUp, Users, DollarSign, Activity, RefreshCw, ArrowRight } from 'lucide-react'
import { useBlockchainContext } from '../context/BlockchainContext'
import { Link } from 'react-router-dom'

function Dashboard() {
  const { account, balances, reserves, mintTokens, isLoading, txLoading, refreshData } = useBlockchainContext()
  const [mintLoading, setMintLoading] = useState({ TKA: false, TKB: false })
  const [refreshing, setRefreshing] = useState(false)
  
  // Calculate TVL
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

  // Calculate percentages for progress bars
  const calculateReservePercentages = () => {
    const reserveA = parseFloat(reserves.reserveA) || 0
    const reserveB = parseFloat(reserves.reserveB) || 0
    const total = reserveA + reserveB
    
    if (total > 0) {
      return {
        reserveAPercent: (reserveA / total) * 100,
        reserveBPercent: (reserveB / total) * 100
      }
    }
    return {
      reserveAPercent: 50,
      reserveBPercent: 50
    }
  }

  const percentages = calculateReservePercentages()

  const stats = [
    { 
      icon: DollarSign, 
      label: 'Total Value Locked', 
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
    await refreshData()
    setRefreshing(false)
  }

  const quickSetup = async () => {
    if (!account) {
      alert('Please connect wallet first')
      return
    }
    
    if (confirm('This will mint 1000 TKA and 1000 TKB\n\nContinue?')) {
      try {
        alert('Minting 1000 TKA...')
        await mintTokens('TKA', '1000')
        
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        alert('Minting 1000 TKB...')
        await mintTokens('TKB', '1000')
        
        alert('✅ Setup complete! Add liquidity from Liquidity tab.')
        
      } catch (error) {
        alert(`❌ Setup failed: ${error.message}`)
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Simplified Header */}
      <div className="mb-10">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-gray-400">Bidirectional AMM on Base Sepolia</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading || refreshing || txLoading}
              className="flex items-center gap-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>
          </div>

          {/* Hero Actions with consistent blue/purple theme */}
          <div className="flex flex-wrap gap-3">
            <Link 
              to="/swap"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              <span>Start Swapping</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to="/liquidity"
              className="px-6 py-3 bg-gray-800 border border-gray-700 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              Add Liquidity
            </Link>
            {/* <button 
              onClick={quickSetup}
              disabled={txLoading || !account}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {txLoading ? 'Processing...' : 'Quick Setup'}
            </button> */}
          </div>
        </div>
      </div>

      {/* Wallet Status - Updated with borders and better alignment */}
      {account ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-emerald-400 font-medium">Wallet Connected</span>
              </div>
              {/* Updated balance display with borders */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Token A Balance</span>
                    <span className="text-xs text-blue-400 font-medium">TKA</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {isLoading ? '...' : (balances.tokenA ? parseFloat(balances.tokenA).toFixed(2) : '0.00')}
                  </p>
                </div>
                <div className="flex-1 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Token B Balance</span>
                    <span className="text-xs text-purple-400 font-medium">TKB</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {isLoading ? '...' : (balances.tokenB ? parseFloat(balances.tokenB).toFixed(2) : '0.00')}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Mint buttons with coin emojis */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => handleMint('TKA')}
                disabled={isLoading || mintLoading.TKA || txLoading}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 min-w-32"
              >
                {mintLoading.TKA ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="text-lg">🪙</span>
                    Mint TKA
                  </>
                )}
              </button>
              <button 
                onClick={() => handleMint('TKB')}
                disabled={isLoading || mintLoading.TKB || txLoading}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 min-w-32"
              >
                {mintLoading.TKB ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="text-lg">🪙</span>
                    Mint TKB
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h3>
          <p className="text-gray-400">Connect to Base Sepolia to start swapping tokens</p>
        </div>
      )}

      {/* Stats Grid - Simplified */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                <p className="text-xl font-bold text-white mb-3">
                  {isLoading ? '...' : stat.value}
                </p>
                <span className="text-emerald-400 text-sm">
                  {stat.change}
                </span>
              </div>
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pool Info - Updated with fixed progress bars */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Liquidity Pool</h3>
          
          <div className="space-y-4 mb-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">TKA Reserve</span>
                <span className="text-white">
                  {isLoading ? '...' : (reserves.reserveA ? parseFloat(reserves.reserveA).toFixed(2) : '0.00')} TKA
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-700 transition-all duration-500"
                  style={{ width: `${percentages.reserveAPercent}%` }}
                ></div>
              </div>
              <div className="text-right text-xs text-gray-500 mt-1">
                {percentages.reserveAPercent.toFixed(1)}%
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">TKB Reserve</span>
                <span className="text-white">
                  {isLoading ? '...' : (reserves.reserveB ? parseFloat(reserves.reserveB).toFixed(2) : '0.00')} TKB
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-purple-700 transition-all duration-500"
                  style={{ width: `${percentages.reserveBPercent}%` }}
                ></div>
              </div>
              <div className="text-right text-xs text-gray-500 mt-1">
                {percentages.reserveBPercent.toFixed(1)}%
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-6 border-t border-gray-800">
            <div>
              <p className="text-gray-400 text-sm">Pool Value</p>
              <p className="text-2xl font-bold text-white">${calculateTVL()}</p>
            </div>
            <Link 
              to="/liquidity"
              className="px-4 py-2 bg-gray-800 border border-gray-700 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              Manage
            </Link>
          </div>
        </div>

        {/* Quick Actions - Simplified */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
          
          <div className="space-y-3">
            <Link 
              to="/swap" 
              className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div>
                <h4 className="font-semibold text-white mb-1">Swap Tokens</h4>
                <p className="text-sm text-gray-400">Exchange TKA for TKB and vice versa</p>
              </div>
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-xl">🔄</span>
              </div>
            </Link>
            
            <Link 
              to="/liquidity" 
              className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div>
                <h4 className="font-semibold text-white mb-1">Add Liquidity</h4>
                <p className="text-sm text-gray-400">Provide liquidity and earn fees</p>
              </div>
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-xl">💧</span>
              </div>
            </Link>
            
            <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
              <h4 className="font-semibold text-white mb-3">Network Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Chain:</span>
                  <span className="text-emerald-400">Base Sepolia</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Chain ID:</span>
                  <span className="text-white">84532</span>
                </div>
                <div className="pt-3">
                  <a 
                    href="https://faucet.quicknode.com/base/sepolia" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Get test ETH from faucet →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard