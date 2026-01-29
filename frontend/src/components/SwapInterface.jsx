import React, { useState, useEffect, useCallback } from 'react'
import { ArrowDown, Settings, Zap, Info } from 'lucide-react'
import { useBlockchainContext } from '../context/BlockchainContext'
import { debounce } from 'lodash'

function SwapInterface() {
  // Use context instead of direct hook
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

  // Get current balance for fromToken
  const getCurrentBalance = useCallback(() => {
    if (fromToken === 'TKA') {
      return parseFloat(balances.tokenA || 0)
    } else {
      return parseFloat(balances.tokenB || 0)
    }
  }, [fromToken, balances])

  // Get current balance for toToken
  const getToTokenBalance = useCallback(() => {
    if (toToken === 'TKA') {
      return parseFloat(balances.tokenA || 0)
    } else {
      return parseFloat(balances.tokenB || 0)
    }
  }, [toToken, balances])

  // Calculate exchange rate
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

  // Calculate minimum received
  const calculateMinimumReceived = useCallback(() => {
    if (!toAmount || isCalculating || parseFloat(toAmount) <= 0) return '0'
    const slippagePercent = parseFloat(slippage) || 0.5
    const minAmount = parseFloat(toAmount) * (1 - (slippagePercent / 100))
    return minAmount.toFixed(4)
  }, [toAmount, isCalculating, slippage])

  // Calculate total liquidity
  const calculateTotalLiquidity = useCallback(() => {
    const reserveA = parseFloat(reserves.reserveA || 0)
    const reserveB = parseFloat(reserves.reserveB || 0)
    return ((reserveA + reserveB) * 1).toFixed(2) // Assuming $1 per token for testnet
  }, [reserves])

  // Calculate fill percentage for slider
  const calculateFillPercentage = useCallback((amount) => {
    const balance = getCurrentBalance()
    if (!amount || parseFloat(amount) <= 0 || balance <= 0) return 0
    const percent = (parseFloat(amount) / balance) * 100
    return Math.min(percent, 100)
  }, [getCurrentBalance])

  // Debounced calculation function
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

  // Calculate when fromAmount changes
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
    const balance = getCurrentBalance()
    
    if (!fromAmount || amount <= 0) {
      alert('Please enter a valid amount')
      return
    }
    
    if (amount > balance) {
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
    const balance = getCurrentBalance()
    if (balance > 0) {
      const amount = (balance * percentage).toFixed(4)
      setFromAmount(amount)
    }
  }

  const balance = getCurrentBalance()
  const toTokenBalance = getToTokenBalance()
  const rate = calculateRate()
  const minReceived = calculateMinimumReceived()
  const totalLiquidity = calculateTotalLiquidity()
  const fillPercent = calculateFillPercentage(fromAmount)

  // Determine swap button state
  const getSwapButtonText = () => {
    if (txLoading) return 'Swapping...'
    if (isLoading) return 'Loading...'
    if (isCalculating) return 'Calculating...'
    if (!account) return 'Connect Wallet to Swap'
    if (!fromAmount || parseFloat(fromAmount) <= 0) return 'Enter Amount'
    if (parseFloat(fromAmount) > balance) return 'Insufficient Balance'
    return 'Swap Tokens'
  }

  const isSwapDisabled = txLoading || isLoading || isCalculating || 
    !fromAmount || parseFloat(fromAmount) <= 0 || 
    !account || parseFloat(fromAmount) > balance

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass-card glow-effect p-1">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold gradient-text">Swap Tokens</h2>
            <button 
              className="p-2 hover:bg-glass rounded-xl transition-colors disabled:opacity-50"
              disabled={txLoading || isLoading}
            >
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* From Token */}
          <div className="glass-card p-6 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">From</span>
              <span className="text-sm text-gray-400">
                Balance: {balance.toFixed(4)} {fromToken}
              </span>
            </div>
            <div className="flex items-center">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.0"
                className="flex-1 bg-transparent text-3xl font-bold outline-none placeholder:text-gray-600"
                disabled={txLoading || isLoading}
                step="any"
                min="0"
              />
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center">
                  <span className="font-bold">{fromToken.charAt(0)}</span>
                </div>
                <select 
                  value={fromToken}
                  onChange={(e) => {
                    setFromToken(e.target.value)
                    setFromAmount('')
                    setToAmount('')
                  }}
                  className="bg-transparent text-lg font-semibold outline-none"
                  disabled={txLoading || isLoading}
                >
                  <option value="TKA">TKA</option>
                  <option value="TKB">TKB</option>
                </select>
              </div>
            </div>
            
            {/* Amount slider */}
            <div className="mt-4">
              <input
                type="range"
                min="0"
                max="100"
                value={fillPercent}
                onChange={(e) => {
                  const percent = parseFloat(e.target.value)
                  const amount = (balance * percent) / 100
                  setFromAmount(amount.toFixed(4))
                }}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:gradient-bg"
                disabled={txLoading || isLoading || balance <= 0}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                {[25, 50, 75, 100].map((percent) => (
                  <button 
                    key={percent}
                    onClick={() => handleSetPercentage(percent / 100)}
                    className="hover:text-white disabled:opacity-50"
                    disabled={txLoading || isLoading || balance <= 0}
                  >
                    {percent}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-3 z-10 relative">
            <button
              onClick={handleSwapTokens}
              className="glass-card w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition-transform border-2 border-dark-bg disabled:opacity-50"
              disabled={txLoading || isLoading}
            >
              <ArrowDown className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* To Token */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">To</span>
              <span className="text-sm text-gray-400">
                Balance: {toTokenBalance.toFixed(4)} {toToken}
              </span>
            </div>
            <div className="flex items-center">
              <input
                type="text"
                value={isCalculating ? 'Calculating...' : toAmount}
                readOnly
                placeholder="0.0"
                className="flex-1 bg-transparent text-3xl font-bold outline-none placeholder:text-gray-600 text-gray-300"
              />
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center">
                  <span className="font-bold">{toToken.charAt(0)}</span>
                </div>
                <select 
                  value={toToken}
                  onChange={(e) => {
                    setToToken(e.target.value)
                    setFromAmount('')
                    setToAmount('')
                  }}
                  className="bg-transparent text-lg font-semibold outline-none"
                  disabled={txLoading || isLoading}
                >
                  <option value="TKA">TKA</option>
                  <option value="TKB">TKB</option>
                </select>
              </div>
            </div>
            {error && (
              <div className="mt-2 text-sm text-red-400">
                <Info className="w-4 h-4 inline mr-1" />
                {error}
              </div>
            )}
          </div>

          {/* Swap Info */}
          <div className="glass-card p-4 mb-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Rate</span>
                <span>
                  1 {fromToken} = {isCalculating ? '...' : rate} {toToken}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Slippage Tolerance</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={slippage}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '' || (parseFloat(value) >= 0.1 && parseFloat(value) <= 5)) {
                        setSlippage(value)
                      }
                    }}
                    className="w-16 bg-transparent text-right outline-none border-b border-gray-700"
                    min="0.1"
                    max="5"
                    step="0.1"
                  />
                  <span>%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Fee</span>
                <span>0.3%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Minimum Received</span>
                <span>
                  {isCalculating ? '...' : minReceived} {toToken}
                </span>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={isSwapDisabled}
            className="w-full group relative overflow-hidden px-8 py-4 gradient-bg rounded-xl font-semibold text-white text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center space-x-2">
              {txLoading || isLoading || isCalculating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{getSwapButtonText()}</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>{getSwapButtonText()}</span>
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="glass-card p-6 text-center">
          <div className="text-2xl font-bold gradient-text">24h Volume</div>
          <div className="text-3xl font-bold mt-2">-</div>
          <div className="text-sm text-gray-400 mt-1">Coming Soon</div>
        </div>
        <div className="glass-card p-6 text-center">
          <div className="text-2xl font-bold gradient-text">Total Liquidity</div>
          <div className="text-3xl font-bold mt-2">
            {isLoading ? '...' : `$${totalLiquidity}`}
          </div>
          <div className="text-sm text-gray-400 mt-1">Estimated Value</div>
        </div>
        <div className="glass-card p-6 text-center">
          <div className="text-2xl font-bold gradient-text">{fromToken}/{toToken} Price</div>
          <div className="text-3xl font-bold mt-2">
            {isCalculating || isLoading ? '...' : rate}
          </div>
          <div className="text-sm text-gray-400 mt-1">Current Rate</div>
        </div>
      </div>
    </div>
  )
}

export default SwapInterface