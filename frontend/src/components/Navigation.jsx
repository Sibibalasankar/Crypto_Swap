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
  const [isScrolled, setIsScrolled] = useState(false)
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/swap', label: 'Swap', icon: RefreshCw },
    { path: '/liquidity', label: 'Liquidity', icon: PieChart },
  ]

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'backdrop-blur-2xl bg-white/10 border-b border-white/20 shadow-2xl' 
          : 'backdrop-blur-xl bg-white/5 border-b border-white/10'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Logo and Brand - Left */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden ">
                <img 
                  src={Logo} 
                  alt="Swap Saga Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white">
                  Swap Saga
                </h1>
              </div>
            </div>

            {/* Desktop Navigation Links - Center */}
            <div className="hidden md:flex items-center space-x-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center space-x-2 px-5 py-2.5 rounded-xl 
                      transition-all duration-300 relative
                      ${isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/60'}`} />
                    <span className="font-medium text-sm">
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-white/30 rounded-full"></div>
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
                className="p-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-white/15 transition-all duration-300"
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
            {/* Backdrop overlay with enhanced glass effect */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Mobile Menu Content with glass effect */}
            <div className="fixed top-16 left-0 right-0 z-50 bg-white/10 backdrop-blur-2xl border-t border-white/10 md:hidden animate-slideDown max-h-[calc(100vh-4rem)] overflow-y-auto">
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
                          transition-all duration-300
                          backdrop-blur-md
                          ${isActive
                            ? 'bg-white/10 border border-white/20'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/70'}`} />
                          <span className={`font-medium ${isActive ? 'text-white' : 'text-white/80'}`}>
                            {item.label}
                          </span>
                        </div>
                        {isActive && (
                          <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                        )}
                      </Link>
                    )
                  })}
                </div>

                {/* Mobile Wallet Connect (Full Width) */}
                <div className="mb-6">
                  <div className="text-center mb-3">
                    <p className="text-sm text-white/70">Wallet Connection</p>
                  </div>
                  <div className="flex justify-center">
                    <WalletConnect />
                  </div>
                </div>

                {/* Mobile Bottom Info */}
                <div className="pt-4 border-t border-white/10">
                  <div className="text-center text-xs text-white/50">
                    <p>Swap Saga AMM • Base Sepolia</p>
                    <p className="mt-1">Bidirectional Automated Market Maker</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Spacer div to prevent content from going under fixed navbar */}
      <div className="h-16 sm:h-20"></div>

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