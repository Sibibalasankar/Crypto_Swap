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

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset'
    return () => (document.body.style.overflow = 'unset')
  }, [isMobileMenuOpen])

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])

  return (
    <>
      {/* NAVBAR */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled
          ? 'backdrop-blur-2xl bg-white/10 border-b border-white/20 shadow-2xl'
          : 'backdrop-blur-xl bg-white/5 border-b border-white/10'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">

            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden">
                <img src={Logo} alt="Swap Saga Logo" className="w-full h-full object-cover" />
              </div>
              <h1 className="hidden sm:block text-xl font-bold text-white">
                Swap Saga
              </h1>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-2 bg-white/5 border border-white/10 rounded-2xl p-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl transition-all
                      ${isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Desktop Wallet */}
            <div className="hidden md:flex">
              <WalletConnect />
            </div>

            {/* Mobile Controls */}
            <div className="flex md:hidden items-center space-x-2">
              <WalletConnect />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-white/10 border border-white/10 text-white"
              >
                {isMobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* FULL SCREEN MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[999] bg-black md:hidden flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <img src={Logo} alt="Logo" className="w-9 h-9 rounded-lg" />
              <span className="text-white font-semibold">Swap Saga</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Menu Links */}
          <div className="flex-1 px-4 py-6 space-y-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-4 p-4 rounded-xl transition-all
                    ${isActive
                      ? 'bg-white/10 border border-white/20'
                      : 'bg-white/5 border border-white/10'
                    }`}
                >
                  <Icon className="w-6 h-6 text-white" />
                  <span className="text-white text-lg font-medium">
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* Wallet Section */}
          <div className="px-4 pb-6">
            <p className="text-center text-sm text-white/60 mb-3">
              Wallet Connection
            </p>
            <div className="flex justify-center">
              <WalletConnect />
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-white/40 pb-4">
            <p>Swap Saga AMM • Base Sepolia</p>
            <p className="mt-1">Bidirectional Automated Market Maker</p>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="h-16 sm:h-20" />
    </>
  )
}

export default Navigation
