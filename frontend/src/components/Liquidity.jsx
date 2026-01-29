import React, { useState, useEffect } from 'react'
import { Plus, Minus, Info } from 'lucide-react'
import { useBlockchainContext } from '../context/BlockchainContext'

function Liquidity() {
  // Use context instead of direct hook
  const { 
    account, 
    balances, 
    reserves, 
    isLoading, 
    txLoading,
    addLiquidity 
  } = useBlockchainContext()
  
  const [tokenAAmount, setTokenAAmount] = useState('')
  const [tokenBAmount, setTokenBAmount] = useState('')
  const [isAdding, setIsAdding] = useState(true)
  const [removePercentage, setRemovePercentage] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  // Get safe reserve values
  const safeReserveA = parseFloat(reserves.reserveA || 0)
  const safeReserveB = parseFloat(reserves.reserveB || 0)
  const safeBalanceA = parseFloat(balances.tokenA || 0)
  const safeBalanceB = parseFloat(balances.tokenB || 0)

  // Calculate proportional amount when one token amount changes
  useEffect(() => {
    if (!tokenAAmount || safeReserveA <= 0 || safeReserveB <= 0) {
      setTokenBAmount('')
      return
    }

    try {
      const amountA = parseFloat(tokenAAmount)
      if (amountA <= 0) {
        setTokenBAmount('')
        return
      }

      // Calculate proportional B amount based on current reserves ratio
      const calculatedB = (amountA * safeReserveB) / safeReserveA
      if (!isNaN(calculatedB)) {
        setTokenBAmount(calculatedB.toFixed(4))
      }
    } catch (err) {
      console.error('Error calculating token B amount:', err)
      setTokenBAmount('')
    }
  }, [tokenAAmount, safeReserveA, safeReserveB])

  // Calculate proportional amount when token B amount changes
  useEffect(() => {
    if (!tokenBAmount || safeReserveA <= 0 || safeReserveB <= 0) {
      setTokenAAmount('')
      return
    }

    try {
      const amountB = parseFloat(tokenBAmount)
      if (amountB <= 0) {
        setTokenAAmount('')
        return
      }

      // Calculate proportional A amount based on current reserves ratio
      const calculatedA = (amountB * safeReserveA) / safeReserveB
      if (!isNaN(calculatedA)) {
        setTokenAAmount(calculatedA.toFixed(4))
      }
    } catch (err) {
      console.error('Error calculating token A amount:', err)
      setTokenAAmount('')
    }
  }, [tokenBAmount, safeReserveA, safeReserveB])

  // Calculate what you'd receive when removing liquidity
  const calculateRemoveAmounts = () => {
    const percentage = removePercentage / 100
    return {
      tka: (safeReserveA * percentage).toFixed(4),
      tkb: (safeReserveB * percentage).toFixed(4)
    }
  }

  const calculatePoolValue = () => {
    return (safeReserveA + safeReserveB).toFixed(2) // Assuming $1 per token for testnet
  }

  const calculateExchangeRate = () => {
    if (safeReserveA <= 0 || safeReserveB <= 0) return '0'
    return (safeReserveB / safeReserveA).toFixed(4)
  }

  const handleAddLiquidity = async () => {
    if (!account) {
      alert('Please connect your wallet first!')
      return
    }
    
    const amountA = parseFloat(tokenAAmount)
    const amountB = parseFloat(tokenBAmount)
    
    if (!tokenAAmount || !tokenBAmount || amountA <= 0 || amountB <= 0) {
      alert('Please enter valid amounts')
      return
    }
    
    if (amountA > safeBalanceA) {
      alert(`Insufficient TKA balance. You have ${safeBalanceA.toFixed(4)} TKA.`)
      return
    }
    
    if (amountB > safeBalanceB) {
      alert(`Insufficient TKB balance. You have ${safeBalanceB.toFixed(4)} TKB.`)
      return
    }
    
    // Validate ratio (within 1% of optimal)
    const optimalRatio = safeReserveB / safeReserveA
    const actualRatio = amountB / amountA
    const ratioDifference = Math.abs((actualRatio - optimalRatio) / optimalRatio) * 100
    
    if (safeReserveA > 0 && safeReserveB > 0 && ratioDifference > 1) {
      if (!confirm(`Your deposit ratio differs from the pool ratio by ${ratioDifference.toFixed(2)}%. You may get less liquidity tokens. Continue anyway?`)) {
        return
      }
    }
    
    setIsProcessing(true)
    setError('')
    
    try {
      await addLiquidity(tokenAAmount, tokenBAmount)
      setTokenAAmount('')
      setTokenBAmount('')
    } catch (error) {
      console.error('Add liquidity failed:', error)
      setError(`Failed to add liquidity: ${error.message || 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRemoveLiquidity = async () => {
    alert('Remove liquidity functionality requires LP tokens. This feature will be available in the next update!')
    // Implementation would require LP token tracking
  }

  const handleSetPercentage = (percentage, token) => {
    const balance = token === 'TKA' ? safeBalanceA : safeBalanceB
    if (balance > 0) {
      const amount = (balance * percentage).toFixed(4)
      if (token === 'TKA') {
        setTokenAAmount(amount)
      } else {
        setTokenBAmount(amount)
      }
    }
  }

  const removeAmounts = calculateRemoveAmounts()
  const poolValue = calculatePoolValue()
  const exchangeRate = calculateExchangeRate()

  const isAddButtonDisabled = isProcessing || isLoading || txLoading || 
    !tokenAAmount || !tokenBAmount || 
    parseFloat(tokenAAmount) <= 0 || parseFloat(tokenBAmount) <= 0 ||
    parseFloat(tokenAAmount) > safeBalanceA || 
    parseFloat(tokenBAmount) > safeBalanceB

  return (
    <div className="max-w-3xl mx-auto">
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold gradient-text">
            {isAdding ? 'Add Liquidity' : 'Remove Liquidity'}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsAdding(true)}
              className={`px-4 py-2 rounded-xl transition-all ${isAdding ? 'gradient-bg' : 'glass-card'}`}
              disabled={txLoading || isLoading}
            >
              Add
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className={`px-4 py-2 rounded-xl transition-all ${!isAdding ? 'gradient-bg' : 'glass-card'}`}
              disabled={txLoading || isLoading}
            >
              Remove
            </button>
          </div>
        </div>

        {!account ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-bold mb-4">Connect Your Wallet</h3>
            <p className="text-gray-400">Please connect your wallet to manage liquidity</p>
          </div>
        ) : isAdding ? (
          <>
            {/* Add Liquidity */}
            <div className="space-y-6">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400">Token A (TKA)</span>
                  <span className="text-sm text-gray-400">
                    Balance: {safeBalanceA.toFixed(4)} TKA
                  </span>
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={tokenAAmount}
                    onChange={(e) => setTokenAAmount(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 bg-transparent text-3xl font-bold outline-none placeholder:text-gray-600"
                    disabled={txLoading || isLoading}
                    step="any"
                    min="0"
                  />
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center">
                      <span className="font-bold">A</span>
                    </div>
                    <span className="text-lg font-semibold">TKA</span>
                  </div>
                </div>
                <div className="flex space-x-2 mt-2">
                  {[25, 50, 75, 100].map((percent) => (
                    <button 
                      key={`tka-${percent}`}
                      onClick={() => handleSetPercentage(percent / 100, 'TKA')}
                      className="text-xs px-2 py-1 bg-glass rounded hover:bg-glass-border disabled:opacity-50"
                      disabled={txLoading || isLoading || safeBalanceA <= 0}
                    >
                      {percent}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400">Token B (TKB)</span>
                  <span className="text-sm text-gray-400">
                    Balance: {safeBalanceB.toFixed(4)} TKB
                  </span>
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={tokenBAmount}
                    onChange={(e) => setTokenBAmount(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 bg-transparent text-3xl font-bold outline-none placeholder:text-gray-600"
                    disabled={txLoading || isLoading}
                    step="any"
                    min="0"
                  />
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center">
                      <span className="font-bold">B</span>
                    </div>
                    <span className="text-lg font-semibold">TKB</span>
                  </div>
                </div>
                <div className="flex space-x-2 mt-2">
                  {[25, 50, 75, 100].map((percent) => (
                    <button 
                      key={`tkb-${percent}`}
                      onClick={() => handleSetPercentage(percent / 100, 'TKB')}
                      className="text-xs px-2 py-1 bg-glass rounded hover:bg-glass-border disabled:opacity-50"
                      disabled={txLoading || isLoading || safeBalanceB <= 0}
                    >
                      {percent}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-card p-4 mb-6">
                <div className="flex items-start space-x-2 text-sm text-gray-400">
                  <Info className="w-4 h-4 mt-1 flex-shrink-0" />
                  <div>
                    <p className="mb-1">
                      Prices and pool share are determined by the current reserves: {safeReserveA.toFixed(4)} TKA : {safeReserveB.toFixed(4)} TKB
                    </p>
                    <p>Ratio: 1 TKA = {exchangeRate} TKB</p>
                    {error && (
                      <p className="text-red-400 mt-2">
                        {error}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddLiquidity}
                disabled={isAddButtonDisabled}
                className="w-full group relative overflow-hidden px-8 py-4 gradient-bg rounded-xl font-semibold text-white text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center space-x-2">
                  {isProcessing || txLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Add Liquidity</span>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Remove Liquidity */}
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Your Liquidity Position</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pool Share</span>
                    <span className="font-medium">0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pool TKA</span>
                    <span className="font-medium">{safeReserveA.toFixed(4)} TKA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pool TKB</span>
                    <span className="font-medium">{safeReserveB.toFixed(4)} TKB</span>
                  </div>
                  <div className="pt-4 border-t border-glass-border">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Pool Value</span>
                      <span className="font-bold gradient-text">
                        ${poolValue}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Percentage to Remove</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={removePercentage}
                    onChange={(e) => setRemovePercentage(parseFloat(e.target.value))}
                    className="w-full h-2 gradient-bg rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-2">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-xl font-bold">{removePercentage}%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">You will receive:</span>
                    <span className="font-medium">{removeAmounts.tka} TKA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400"></span>
                    <span className="font-medium">{removeAmounts.tkb} TKB</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleRemoveLiquidity}
                disabled={true}
                className="w-full group relative overflow-hidden px-8 py-4 bg-gray-700 rounded-xl font-semibold text-white text-lg shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center space-x-2">
                  <Minus className="w-5 h-5" />
                  <span>Remove Liquidity (Coming Soon)</span>
                </span>
              </button>
              
              <div className="text-center text-sm text-gray-400">
                <p>LP tokens required for removing liquidity. This feature will be available in the next update.</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-6 mt-8">
        <div className="glass-card p-6">
          <h4 className="text-lg font-semibold mb-4 gradient-text">Pool Statistics</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Liquidity</span>
              <span>${poolValue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">TKA Reserve</span>
              <span>{safeReserveA.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">TKB Reserve</span>
              <span>{safeReserveB.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Exchange Rate</span>
              <span>1 TKA = {exchangeRate} TKB</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h4 className="text-lg font-semibold mb-4 gradient-text">Your Position</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Your TKA Balance</span>
              <span className="gradient-text">{safeBalanceA.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Your TKB Balance</span>
              <span className="gradient-text">{safeBalanceB.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Current APR</span>
              <span className="gradient-text">-</span>
            </div>
            <div className="pt-3 border-t border-glass-border">
              <button 
                onClick={() => setIsAdding(true)}
                className="w-full glass-card py-2 font-medium hover:scale-105 transition-transform disabled:opacity-50"
                disabled={txLoading || isLoading}
              >
                Add More Liquidity
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Liquidity