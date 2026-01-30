import React, { useState, useEffect, useCallback } from 'react'
import { ArrowDown, Zap, Info } from 'lucide-react'
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

  const rate = calculateRate()
  const minReceived = calculateMinimumReceived()
  const totalLiquidity = calculateTotalLiquidity()

  const getSwapButtonText = () => {
    if (txLoading) return 'Swapping...'
    if (isLoading) return 'Loading...'
    if (isCalculating) return 'Calculating...'
    if (!account) return 'Connect Wallet'
    if (!fromAmount || parseFloat(fromAmount) <= 0) return 'Enter Amount'
    if (parseFloat(fromAmount) > fromBalance) return 'Insufficient Balance'
    return 'Swap'
  }

  const isSwapDisabled = txLoading || isLoading || isCalculating || 
    !fromAmount || parseFloat(fromAmount) <= 0 || 
    !account || parseFloat(fromAmount) > fromBalance

  return (
    <div className="max-w-md mx-auto px-4">
      {/* Main Swap Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Swap</h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-sm text-gray-400">Testnet</span>
          </div>
        </div>

        {/* From Token */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400 font-medium">From</span>
            <span className="text-sm text-gray-400">
              Balance: {fromBalance.toFixed(4)}
            </span>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl sm:text-3xl font-semibold outline-none text-white placeholder:text-gray-500 min-w-0"
              disabled={txLoading || isLoading}
              step="any"
              min="0"
            />
            
            {/* Compact Token Selector */}
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => {
                  if (fromToken !== 'TKA') {
                    setFromToken('TKA')
                    setFromAmount('')
                    setToAmount('')
                  }
                }}
                className={`px-3 py-2 rounded-lg font-semibold text-sm sm:text-base ${
                  fromToken === 'TKA' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                disabled={txLoading || isLoading}
              >
                TKA
              </button>
              <button
                onClick={() => {
                  if (fromToken !== 'TKB') {
                    setFromToken('TKB')
                    setFromAmount('')
                    setToAmount('')
                  }
                }}
                className={`px-3 py-2 rounded-lg font-semibold text-sm sm:text-base ${
                  fromToken === 'TKB' 
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                disabled={txLoading || isLoading}
              >
                TKB
              </button>
            </div>
          </div>
          
          {/* Quick Amount Buttons */}
          <div className="flex gap-2">
            {[25, 50, 75, 100].map((percent) => (
              <button 
                key={percent}
                onClick={() => handleSetPercentage(percent / 100)}
                className="flex-1 px-2 py-1.5 text-xs font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:border-gray-500 hover:text-white transition-colors disabled:opacity-50"
                disabled={txLoading || isLoading || fromBalance <= 0}
              >
                {percent}%
              </button>
            ))}
          </div>
        </div>

        {/* Swap Direction Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            onClick={handleSwapTokens}
            className="bg-gray-900 border-4 border-gray-900 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50"
            disabled={txLoading || isLoading}
          >
            <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </button>
        </div>

        {/* To Token */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400 font-medium">To (Estimated)</span>
            <span className="text-sm text-gray-400">
              Balance: {toBalance.toFixed(4)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={isCalculating ? 'Calculating...' : toAmount}
              readOnly
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl sm:text-3xl font-semibold outline-none text-gray-300 placeholder:text-gray-500 min-w-0"
            />
            
            {/* Compact Token Selector */}
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => {
                  if (toToken !== 'TKA') {
                    setToToken('TKA')
                    setFromAmount('')
                    setToAmount('')
                  }
                }}
                className={`px-3 py-2 rounded-lg font-semibold text-sm sm:text-base ${
                  toToken === 'TKA' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                disabled={txLoading || isLoading}
              >
                TKA
              </button>
              <button
                onClick={() => {
                  if (toToken !== 'TKB') {
                    setToToken('TKB')
                    setFromAmount('')
                    setToAmount('')
                  }
                }}
                className={`px-3 py-2 rounded-lg font-semibold text-sm sm:text-base ${
                  toToken === 'TKB' 
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                disabled={txLoading || isLoading}
              >
                TKB
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-2 text-sm text-red-400 flex items-center gap-1">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span className="break-words">{error}</span>
            </div>
          )}
        </div>

        {/* Swap Details */}
        {fromAmount && parseFloat(fromAmount) > 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Rate</span>
              <span className="font-medium text-white">
                1 {fromToken} = {isCalculating ? '...' : rate} {toToken}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Fee</span>
              <span className="font-medium text-white">0.3%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Minimum received</span>
              <span className="font-medium text-white">
                {isCalculating ? '...' : minReceived} {toToken}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Slippage tolerance</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={slippage}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === '' || (parseFloat(value) >= 0.1 && parseFloat(value) <= 5)) {
                      setSlippage(value)
                    }
                  }}
                  className="w-12 sm:w-14 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white text-right outline-none"
                  min="0.1"
                  max="5"
                  step="0.1"
                />
                <span className="font-medium text-white text-sm">%</span>
              </div>
            </div>
          </div>
        )}

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={isSwapDisabled}
          className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {txLoading || isLoading || isCalculating ? (
            <>
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm sm:text-base">{getSwapButtonText()}</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">{getSwapButtonText()}</span>
            </>
          )}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4 text-center">
          <div className="text-xs text-gray-400 mb-1 font-medium">24h Volume</div>
          <div className="text-lg sm:text-xl font-bold text-white">-</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4 text-center">
          <div className="text-xs text-gray-400 mb-1 font-medium">TVL</div>
          <div className="text-lg sm:text-xl font-bold text-white">
            {isLoading ? '...' : `$${totalLiquidity}`}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4 text-center">
          <div className="text-xs text-gray-400 mb-1 font-medium">Price</div>
          <div className="text-lg sm:text-xl font-bold text-white">
            {isCalculating || isLoading ? '...' : rate}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SwapInterface