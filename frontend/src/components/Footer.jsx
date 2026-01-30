import React from 'react'
import { ExternalLink } from 'lucide-react'

function Footer() {
  const contractAddresses = {
    tokenA: "0x1426DA8803cafC77c7B78329ED84d9477B380B6c",
    tokenB: "0x40616A3e2C3c6868F455d92919253Ec1d48A4fF8",
    swap: "0x71237162c8DB4b52135caa2B6A9993e7d72Bbf52"
  }

  const networkInfo = {
    name: "Base Sepolia",
    explorer: "https://sepolia.basescan.org",
    faucet: "https://faucet.quicknode.com/base/sepolia"
  }

  return (
    <footer className="border-t border-gray-800 mt-8">
      <div className="container mx-auto px-4 py-6">
        {/* Main Content - Flex layout for both ends */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
          {/* Left: Info Section */}
          <div className="space-y-2">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Swap Saga AMM</h3>
              <p className="text-gray-500 text-sm">
                Bidirectional AMM on Base Sepolia
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-sm text-gray-400">Testnet Live</span>
            </div>
          </div>
          
          {/* Right: Contracts Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-400 mb-2 text-right">Contract Addresses</h4>
            
            <div className="space-y-2 text-right">
              {/* TKA - Name and address on same line */}
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm text-gray-300">TKA</span>
                <a 
                  href={`${networkInfo.explorer}/address/${contractAddresses.tokenA}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono text-gray-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                >
                  {contractAddresses.tokenA.slice(0, 6)}...{contractAddresses.tokenA.slice(-4)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              
              {/* TKB - Name and address on same line */}
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm text-gray-300">TKB</span>
                <a 
                  href={`${networkInfo.explorer}/address/${contractAddresses.tokenB}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono text-gray-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                >
                  {contractAddresses.tokenB.slice(0, 6)}...{contractAddresses.tokenB.slice(-4)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              
              {/* Pool - Name and address on same line */}
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm text-gray-300">Pool</span>
                <a 
                  href={`${networkInfo.explorer}/address/${contractAddresses.swap}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono text-gray-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                >
                  {contractAddresses.swap.slice(0, 6)}...{contractAddresses.swap.slice(-4)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <p className="text-xs text-gray-500">
                © {new Date().getFullYear()} Swap Saga AMM • Base Sepolia
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <a 
                href={networkInfo.faucet}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
              >
                Faucet
                <ExternalLink className="w-3 h-3" />
              </a>
              <a 
                href={networkInfo.explorer}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
              >
                Explorer
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer