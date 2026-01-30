import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  RefreshCw,
  PieChart,
  Menu,
  X
} from 'lucide-react'
import Logo from '../assets/Logo.png'
import WalletConnect from './WalletConnect'

function Navigation() {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/swap', label: 'Swap', icon: RefreshCw },
    { path: '/liquidity', label: 'Liquidity', icon: PieChart },
  ]

  // Prevent body scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  // Close menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-gray-900/95 border-b border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Logo and Brand - Left */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden">
                <img 
                  src={Logo} 
                  alt="Swap Saga Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Swap Saga
                </h1>
              </div>
            </div>

            {/* Desktop Navigation Links - Center */}
            <div className="hidden md:flex items-center space-x-2 bg-gray-900/50 border border-gray-800 rounded-2xl p-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center space-x-2 px-5 py-2.5 rounded-xl 
                      transition-all duration-200 relative
                      ${isActive
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                    <span className="font-medium text-sm">
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Desktop Right Section - Only Wallet */}
            <div className="hidden md:flex items-center">
              <div className="flex items-center">
                <WalletConnect />
              </div>
            </div>

            {/* Mobile: Wallet Connect Button & Menu Button */}
            <div className="flex items-center space-x-2 md:hidden">
              <div className="scale-90">
                <WalletConnect />
              </div>
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu - Fixed on top of everything */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <div 
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Mobile Menu Content */}
            <div className="fixed top-16 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 md:hidden animate-slideDown max-h-[calc(100vh-4rem)] overflow-y-auto">
              <div className="container mx-auto px-4 py-4">
                {/* Mobile Navigation Links */}
                <div className="space-y-2 mb-6">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`
                          flex items-center justify-between p-4 rounded-xl 
                          transition-all duration-200
                          ${isActive
                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30'
                            : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                          <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                            {item.label}
                          </span>
                        </div>
                        {isActive && (
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                        )}
                      </Link>
                    )
                  })}
                </div>

                {/* Mobile Wallet Connect (Full Width) */}
                <div className="mb-6">
                  <div className="text-center mb-3">
                    <p className="text-sm text-gray-400">Wallet Connection</p>
                  </div>
                  <div className="flex justify-center">
                    <WalletConnect />
                  </div>
                </div>

                {/* Mobile Bottom Info */}
                <div className="pt-4 border-t border-gray-800">
                  <div className="text-center text-xs text-gray-500">
                    <p>Swap Saga AMM • Base Sepolia</p>
                    <p className="mt-1">Bidirectional Automated Market Maker</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Add slide down animation */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </>
  )
}

export default Navigation