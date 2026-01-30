import React, { useState, useEffect, useCallback } from 'react'
import { ArrowDown, Zap, Info, TrendingUp, ArrowDownUp } from 'lucide-react'
import { useBlockchainContext } from '../context/BlockchainContext'
import { debounce } from 'lodash'

function SwapInterface() {
  const { 
    account, 
    balances, 
    reserves, 
    isLoading, 
    txLoading,
    swapTokens, 
    getSwapAmountOut
  } = useBlockchainContext()
  
  const [fromToken, setFromToken] = useState('TKA')
  const [toToken, setToToken] = useState('TKB')
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [slippage, setSlippage] = useState('0.5')
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState('')

  // Calculate current balances
  const fromBalance = parseFloat(fromToken === 'TKA' ? balances.tokenA || 0 : balances.tokenB || 0)
  const toBalance = parseFloat(toToken === 'TKA' ? balances.tokenA || 0 : balances.tokenB || 0)

  const calculateRate = useCallback(() => {
    const reserveA = parseFloat(reserves.reserveA || 0)
    const reserveB = parseFloat(reserves.reserveB || 0)
    
    if (reserveA <= 0 || reserveB <= 0) return '0'
    
    if (fromToken === 'TKA') {
      return (reserveB / reserveA).toFixed(4)
    } else {
      return (reserveA / reserveB).toFixed(4)
    }
  }, [fromToken, reserves])

  const calculateMinimumReceived = useCallback(() => {
    if (!toAmount || isCalculating || parseFloat(toAmount) <= 0) return '0'
    const slippagePercent = parseFloat(slippage) || 0.5
    const minAmount = parseFloat(toAmount) * (1 - (slippagePercent / 100))
    return minAmount.toFixed(4)
  }, [toAmount, isCalculating, slippage])

  const calculateTotalLiquidity = useCallback(() => {
    const reserveA = parseFloat(reserves.reserveA || 0)
    const reserveB = parseFloat(reserves.reserveB || 0)
    return ((reserveA + reserveB) * 1).toFixed(2)
  }, [reserves])

  const calculateSwap = useCallback(
    debounce(async (amount, token) => {
      if (!amount || parseFloat(amount) <= 0 || !account || !getSwapAmountOut) {
        setToAmount('')
        return
      }
      
      setIsCalculating(true)
      setError('')
      try {
        const amountOut = await getSwapAmountOut(token, amount)
        setToAmount(amountOut || '0')
      } catch (error) {
        console.error('Error calculating swap:', error)
        setError('Failed to calculate swap amount')
        setToAmount('0')
      } finally {
        setIsCalculating(false)
      }
    }, 300),
    [getSwapAmountOut, account]
  )

  useEffect(() => {
    calculateSwap(fromAmount, fromToken)
  }, [fromAmount, fromToken, calculateSwap])

  const handleSwapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount('')
    setToAmount('')
    setError('')
  }

  const handleSwap = async () => {
    if (!account) {
      alert('Please connect your wallet first!')
      return
    }
    
    const amount = parseFloat(fromAmount)
    
    if (!fromAmount || amount <= 0) {
      alert('Please enter a valid amount')
      return
    }
    
    if (amount > fromBalance) {
      alert(`Insufficient ${fromToken} balance`)
      return
    }
    
    if (!getSwapAmountOut) {
      alert('Swap function not available')
      return
    }
    
    try {
      await swapTokens(fromToken, fromAmount)
      setFromAmount('')
      setToAmount('')
      setError('')
    } catch (error) {
      console.error('Swap failed:', error)
      setError(`Swap failed: ${error.message || 'Unknown error'}`)
    }
  }

  const handleSetPercentage = (percentage) => {
    if (fromBalance > 0) {
      const amount = (fromBalance * percentage).toFixed(4)
      setFromAmount(amount)
    }
  }

  // Calculate values - order matters!
  const rate = calculateRate()
  const minReceived = calculateMinimumReceived()
  const totalLiquidity = calculateTotalLiquidity()
  
  // Calculate price impact using the rate that's now defined
  const calculatePriceImpact = () => {
    if (!fromAmount || !toAmount || parseFloat(fromAmount) <= 0 || parseFloat(toAmount) <= 0) return '0'
    const expectedRate = parseFloat(rate)
    const actualRate = parseFloat(toAmount) / parseFloat(fromAmount)
    if (expectedRate <= 0) return '0'
    const impact = ((expectedRate - actualRate) / expectedRate) * 100
    return Math.abs(impact).toFixed(2)
  }
  
  const priceImpact = calculatePriceImpact()

  const getSwapButtonText = () => {
    if (txLoading) return 'Swapping...'
    if (isLoading) return 'Loading...'
    if (isCalculating) return 'Calculating...'
    if (!account) return 'Connect Wallet'
    if (!fromAmount || parseFloat(fromAmount) <= 0) return 'Enter Amount'
    if (parseFloat(fromAmount) > fromBalance) return 'Insufficient Balance'
    return 'Swap Tokens'
  }

  const isSwapDisabled = txLoading || isLoading || isCalculating || 
    !fromAmount || parseFloat(fromAmount) <= 0 || 
    !account || parseFloat(fromAmount) > fromBalance

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Main Swap Card - More Compact */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl -z-10"></div>
        
        <div className="bg-gradient-to-br from-gray-900/95 to-gray-900/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-4 shadow-2xl">
          {/* Compact Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Swap
            </h2>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-800/50 border border-gray-700/50 rounded-lg">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">Base Sepolia</span>
            </div>
          </div>

          {/* From Token - More Compact */}
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-800/70 border border-gray-700/50 rounded-xl p-3 mb-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Pay</span>
                <div className={`px-2 py-0.5 rounded-md font-semibold text-white text-xs ${
                  fromToken === 'TKA' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700' 
                    : 'bg-gradient-to-r from-purple-600 to-purple-700'
                }`}>
                  {fromToken}
                </div>
              </div>
              <span className="text-xs text-gray-500">Balance: {fromBalance.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.0"
                className="flex-1 bg-transparent text-2xl font-bold outline-none text-white placeholder:text-gray-600"
                disabled={txLoading || isLoading}
                step="any"
                min="0"
              />
            </div>
            
            {/* Quick Buttons - More Compact */}
            <div className="flex gap-1.5">
              {[25, 50, 75, 100].map((percent) => (
                <button 
                  key={percent}
                  onClick={() => handleSetPercentage(percent / 100)}
                  className="flex-1 px-2 py-1 text-xs font-medium text-gray-300 bg-gray-700/50 border border-gray-600/50 rounded hover:bg-gray-600/50 hover:text-white transition-all disabled:opacity-50"
                  disabled={txLoading || isLoading || fromBalance <= 0}
                >
                  {percent}%
                </button>
              ))}
            </div>
          </div>

          {/* Swap Button - Centered and Compact */}
          <div className="flex justify-center my-2">
            <button
              onClick={handleSwapTokens}
              className="bg-gray-800 border border-gray-700 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-all disabled:opacity-50"
              disabled={txLoading || isLoading}
            >
              <ArrowDownUp className="w-3 h-3 text-gray-300" />
            </button>
          </div>

          {/* To Token - More Compact */}
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-800/70 border border-gray-700/50 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Receive</span>
                <div className={`px-2 py-0.5 rounded-md font-semibold text-white text-xs ${
                  toToken === 'TKA' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700' 
                    : 'bg-gradient-to-r from-purple-600 to-purple-700'
                }`}>
                  {toToken}
                </div>
              </div>
              <span className="text-xs text-gray-500">Balance: {toBalance.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={isCalculating ? 'Calculating...' : toAmount}
                readOnly
                placeholder="0.0"
                className="flex-1 bg-transparent text-2xl font-bold outline-none text-gray-300 placeholder:text-gray-600"
              />
            </div>
            
            {error && (
              <div className="mt-3 p-2 bg-red-900/20 border border-red-800/50 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-red-400">
                  <Info className="w-3 h-3 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Swap Details - Integrated into main card */}
          {fromAmount && parseFloat(fromAmount) > 0 && (
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/60 border border-gray-700/50 rounded-xl p-3 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-xs text-gray-400">Rate</div>
                <div className="text-xs font-medium text-white text-right">
                  1 {fromToken} = {isCalculating ? '...' : rate} {toToken}
                </div>
                
                <div className="text-xs text-gray-400">Impact</div>
                <div className={`text-xs font-medium text-right ${
                  parseFloat(priceImpact) > 5 ? 'text-red-400' : 
                  parseFloat(priceImpact) > 2 ? 'text-yellow-400' : 
                  'text-emerald-400'
                }`}>
                  {isCalculating ? '...' : `${priceImpact}%`}
                </div>
                
                <div className="text-xs text-gray-400">Min Received</div>
                <div className="text-xs font-medium text-white text-right">
                  {isCalculating ? '...' : minReceived} {toToken}
                </div>
                
                <div className="text-xs text-gray-400">Slippage</div>
                <div className="flex items-center justify-end gap-1">
                  <input
                    type="number"
                    value={slippage}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '' || (parseFloat(value) >= 0.1 && parseFloat(value) <= 5)) {
                        setSlippage(value)
                      }
                    }}
                    className="w-12 bg-gray-700/50 border border-gray-600/50 rounded px-1.5 py-0.5 text-xs text-white text-center outline-none"
                    min="0.1"
                    max="5"
                    step="0.1"
                  />
                  <span className="text-xs text-gray-400">%</span>
                </div>
              </div>
            </div>
          )}

          {/* Pool Stats - Horizontal layout */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/60 border border-gray-700/50 rounded-xl p-2 text-center">
              <div className="text-xs text-gray-400">TVL</div>
              <div className="text-sm font-bold text-white">
                {isLoading ? '...' : `$${totalLiquidity}`}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/60 border border-gray-700/50 rounded-xl p-2 text-center">
              <div className="text-xs text-gray-400">Rate</div>
              <div className="text-sm font-bold text-white">
                {isCalculating || isLoading ? '...' : rate}
              </div>
              <div className="text-xs text-gray-500">{fromToken}/{toToken}</div>
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={isSwapDisabled}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {txLoading || isLoading || isCalculating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">{getSwapButtonText()}</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span className="text-sm">{getSwapButtonText()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SwapInterface