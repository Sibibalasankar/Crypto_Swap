import React, { useState, useEffect } from 'react'
import { Plus, Minus, Info, ChevronDown } from 'lucide-react'
import { useBlockchainContext } from '../context/BlockchainContext'

function Liquidity() {
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
    return (safeReserveA + safeReserveB).toFixed(2)
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
    <div className="relative">
      {/* Global Soft Blur Wrapper */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] rounded-3xl" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    Liquidity
                  </h1>
                  <p className="text-white/70 text-sm">
                    Add liquidity to earn trading fees
                  </p>
                </div>
                
                {/* Mode Toggle */}
                <div className="flex bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1">
                  <button
                    onClick={() => setIsAdding(true)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isAdding 
                        ? 'bg-white/10 text-white' 
                        : 'text-white/70 hover:text-white'
                    }`}
                    disabled={txLoading || isLoading}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setIsAdding(false)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      !isAdding 
                        ? 'bg-white/10 text-white' 
                        : 'text-white/70 hover:text-white'
                    }`}
                    disabled={txLoading || isLoading}
                  >
                    Remove
                  </button>
                </div>
              </div>

              {!account ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
                    <Info className="w-8 h-8 text-white/70" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
                  <p className="text-white/70">Please connect your wallet to manage liquidity</p>
                </div>
              ) : isAdding ? (
                <>
                  {/* Add Liquidity Form */}
                  <div className="space-y-4">
                    {/* Token A Input */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-white/70">Token A</span>
                        <span className="text-xs text-white/70">
                          Balance: <span className="text-white">{safeBalanceA.toFixed(4)}</span> TKA
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          value={tokenAAmount}
                          onChange={(e) => setTokenAAmount(e.target.value)}
                          placeholder="0.0"
                          className="flex-1 bg-transparent text-2xl sm:text-3xl font-bold outline-none text-white placeholder:text-white/30 min-w-0"
                          disabled={txLoading || isLoading}
                          step="any"
                          min="0"
                        />
                        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="font-bold text-white text-sm">A</span>
                          </div>
                          <span className="font-semibold text-white">TKA</span>
                          <ChevronDown className="w-4 h-4 text-white/60" />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        {[25, 50, 75, 100].map((percent) => (
                          <button 
                            key={`tka-${percent}`}
                            onClick={() => handleSetPercentage(percent / 100, 'TKA')}
                            className="flex-1 px-3 py-1.5 text-xs font-medium text-white/70 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
                            disabled={txLoading || isLoading || safeBalanceA <= 0}
                          >
                            {percent}%
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Plus Icon */}
                    <div className="flex justify-center my-2">
                      <div className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center">
                        <Plus className="w-5 h-5 text-white/70" />
                      </div>
                    </div>

                    {/* Token B Input */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-white/70">Token B</span>
                        <span className="text-xs text-white/70">
                          Balance: <span className="text-white">{safeBalanceB.toFixed(4)}</span> TKB
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          value={tokenBAmount}
                          onChange={(e) => setTokenBAmount(e.target.value)}
                          placeholder="0.0"
                          className="flex-1 bg-transparent text-2xl sm:text-3xl font-bold outline-none text-white placeholder:text-white/30 min-w-0"
                          disabled={txLoading || isLoading}
                          step="any"
                          min="0"
                        />
                        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="font-bold text-white text-sm">B</span>
                          </div>
                          <span className="font-semibold text-white">TKB</span>
                          <ChevronDown className="w-4 h-4 text-white/60" />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        {[25, 50, 75, 100].map((percent) => (
                          <button 
                            key={`tkb-${percent}`}
                            onClick={() => handleSetPercentage(percent / 100, 'TKB')}
                            className="flex-1 px-3 py-1.5 text-xs font-medium text-white/70 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
                            disabled={txLoading || isLoading || safeBalanceB <= 0}
                          >
                            {percent}%
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-white/80 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="text-white/80 mb-1">
                            Current ratio: 1 TKA = {exchangeRate} TKB
                          </p>
                          <p className="text-white/60 text-xs">
                            Pool reserves: {safeReserveA.toFixed(4)} TKA : {safeReserveB.toFixed(4)} TKB
                          </p>
                          {error && (
                            <p className="text-red-300 mt-2 text-sm">
                              {error}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Add Button */}
                    <button
                      onClick={handleAddLiquidity}
                      disabled={isAddButtonDisabled}
                      className="w-full px-6 py-3.5 bg-white/10 backdrop-blur-md text-white font-semibold rounded-xl hover:bg-white/15 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-white/10"
                    >
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
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Remove Liquidity */}
                  <div className="space-y-4">
                    {/* Current Position */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-5">
                      <h3 className="text-lg font-semibold text-white mb-4">Your Liquidity Position</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">Pool Share</span>
                          <span className="font-medium text-white">0%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">Pool TKA</span>
                          <span className="font-medium text-white">{safeReserveA.toFixed(4)} TKA</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">Pool TKB</span>
                          <span className="font-medium text-white">{safeReserveB.toFixed(4)} TKB</span>
                        </div>
                        <div className="pt-4 border-t border-white/10">
                          <div className="flex justify-between items-center">
                            <span className="text-white/70">Total Pool Value</span>
                            <span className="text-xl font-bold text-white">
                              ${poolValue}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Percentage Slider */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-5">
                      <div className="mb-6">
                        <div className="flex justify-between mb-2">
                          <label className="text-white/70">Percentage to Remove</label>
                          <span className="text-xl font-bold text-white">{removePercentage}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={removePercentage}
                          onChange={(e) => setRemovePercentage(parseFloat(e.target.value))}
                          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white/50"
                        />
                        <div className="flex justify-between text-xs text-white/50 mt-2 px-1">
                          <span>0%</span>
                          <span>25%</span>
                          <span>50%</span>
                          <span>75%</span>
                          <span>100%</span>
                        </div>
                      </div>

                      {/* Amounts to Receive */}
                      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-4">
                        <h4 className="text-sm text-white/70 mb-3">You will receive:</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-white">A</span>
                              </div>
                              <span className="text-white/70">TKA</span>
                            </div>
                            <span className="font-medium text-white">{removeAmounts.tka}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-white">B</span>
                              </div>
                              <span className="text-white/70">TKB</span>
                            </div>
                            <span className="font-medium text-white">{removeAmounts.tkb}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={handleRemoveLiquidity}
                      disabled={true}
                      className="w-full px-6 py-3.5 bg-white/10 backdrop-blur-md text-white/50 font-semibold rounded-xl border border-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Minus className="w-5 h-5" />
                      <span>Remove Liquidity (Coming Soon)</span>
                    </button>
                    
                    <div className="text-center text-sm text-white/50">
                      <p>LP tokens required for removing liquidity. This feature will be available in the next update.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Stats Sidebar - Right */}
          <div className="space-y-6">
            {/* Pool Stats */}
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                Pool Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Total Liquidity</span>
                  <span className="font-medium text-white">${poolValue}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">TKA Reserve</span>
                  <span className="font-medium text-white">{safeReserveA.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">TKB Reserve</span>
                  <span className="font-medium text-white">{safeReserveB.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Exchange Rate</span>
                  <span className="font-medium text-white">1 TKA = {exchangeRate} TKB</span>
                </div>
              </div>
            </div>

            {/* Your Position */}
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                Your Position
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Your TKA Balance</span>
                  <span className="font-medium text-white">{safeBalanceA.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Your TKB Balance</span>
                  <span className="font-medium text-white">{safeBalanceB.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Current APR</span>
                  <span className="font-medium text-white">-</span>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <button 
                    onClick={() => setIsAdding(true)}
                    className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-md text-white font-medium rounded-lg hover:bg-white/15 transition-all duration-300 border border-white/10 disabled:opacity-50"
                    disabled={txLoading || isLoading}
                  >
                    Add More Liquidity
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Info</h3>
              <div className="space-y-3 text-sm">
                <p className="text-white/70">
                  • Provide liquidity in a 50:50 ratio
                </p>
                <p className="text-white/70">
                  • Earn 0.3% trading fees
                </p>
                <p className="text-white/70">
                  • Impermanent loss risks apply
                </p>
                <p className="text-white/70">
                  • You'll receive LP tokens
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Liquidity