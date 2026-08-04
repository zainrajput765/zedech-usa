'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Logo from './Logo';
import {
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  LogOut,
  Settings,
  Menu,
  X,
  ChevronDown,
  ShoppingBag,
} from 'lucide-react';
import CartDrawer from './CartDrawer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Header() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const { cartItems, wishlistItems } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search suggestions
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/products/suggestions?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data.success) {
          setSearchSuggestions(data.suggestions);
        }
      } catch (err) {
        console.error('Error fetching suggestions', err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (slug: string) => {
    setSearchQuery('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
    router.push(`/product/${slug}`);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <header className="sticky top-0 left-0 w-full z-40 glass-nav transition-all duration-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/" className="text-xl font-bold tracking-tight flex-shrink-0 flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span>ZEDECH</span>
          </Link>

          {/* Navigation Mega Menu (Desktop) */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold">
            <Link href="/shop" className="hover:text-muted-foreground transition-colors">Shop</Link>
            
            {/* Mega menu categories */}
            <div className="relative group py-2">
              <button className="flex items-center gap-1 hover:text-muted-foreground transition-colors focus:outline-none">
                Categories <ChevronDown className="w-3.5 h-3.5" />
              </button>
              
              {/* Dropdown panel */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[420px] bg-background border border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-5 grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Lifestyle</h4>
                  <Link href="/shop?category=apparel" className="block text-sm font-medium hover:text-muted-foreground transition-colors">Apparel & Coats</Link>
                  <Link href="/shop?category=accessories" className="block text-sm font-medium hover:text-muted-foreground transition-colors">Leather Accessories</Link>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Performance</h4>
                  <Link href="/shop?category=footwear" className="block text-sm font-medium hover:text-muted-foreground transition-colors">Athletic Footwear</Link>
                  <Link href="/shop?category=electronics" className="block text-sm font-medium hover:text-muted-foreground transition-colors">Smart Audio & Tech</Link>
                </div>
              </div>
            </div>

            <Link href="/about" className="hover:text-muted-foreground transition-colors">Our Story</Link>
            <Link href="/faq" className="hover:text-muted-foreground transition-colors">FAQs</Link>
          </nav>

          {/* Search bar & suggestion panel */}
          <div ref={searchRef} className="hidden sm:block flex-1 max-w-md relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search products, brands, or tags..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full bg-muted/60 hover:bg-muted border border-transparent focus:border-border rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none transition-all"
              />
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            </form>

            {/* Autocomplete drop-down suggestions */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-background border border-border rounded-xl shadow-xl overflow-hidden z-50">
                <div className="p-3 text-[10px] uppercase font-bold text-muted-foreground border-b border-border">
                  Matching Products
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {searchSuggestions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSuggestionClick(item.slug)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted text-left transition-colors"
                    >
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-8 h-8 rounded object-cover bg-muted"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate text-foreground">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.brand} / ${item.price.toFixed(2)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Operations */}
          <div className="flex items-center space-x-4">
            
            {/* Wishlist */}
            <Link
              href="/profile?tab=wishlist"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-foreground text-background text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center scale-90">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={() => setCartOpen(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative"
              aria-label="Shopping Cart"
            >
              <motion.div
                animate={cartCount > 0 ? {
                  rotate: [0, -8, 8, -8, 8, 0],
                  scale: [1, 1.05, 1.05, 1.05, 1.05, 1],
                } : {}}
                transition={cartCount > 0 ? {
                  duration: 0.6,
                  repeat: Infinity,
                  repeatDelay: 4,
                  ease: 'easeInOut',
                } : {}}
              >
                <ShoppingCart className="w-5 h-5" />
              </motion.div>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                  className="absolute top-0.5 right-0.5 bg-foreground text-background text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center scale-90"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            {/* User Account Menu (Desktop) */}
            <div ref={dropdownRef} className="relative hidden sm:block">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    <UserIcon className="w-4 h-4 text-foreground" />
                    <span className="max-w-[80px] truncate">{user?.name}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2.5 w-48 bg-background border border-border rounded-xl shadow-xl py-1.5 z-50">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-xs font-bold text-foreground truncate">{user?.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                      </div>
                      
                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium hover:bg-muted transition-colors"
                      >
                        <UserIcon className="w-4 h-4" /> Personal Information
                      </Link>
                      
                      <Link
                        href="/profile?tab=orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium hover:bg-muted transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4" /> Order History
                      </Link>

                      {user?.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-primary hover:bg-muted border-t border-border transition-colors"
                        >
                          <Settings className="w-4 h-4" /> Admin Dashboard
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          router.push('/login');
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-500/10 border-t border-border transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Log Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/login"
                  className="bg-foreground text-background text-xs font-semibold px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Log In
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground md:hidden hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-b border-border px-6 py-4 space-y-4">
            {/* Search (Mobile) */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-muted border border-transparent rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none"
              />
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            </form>

            <nav className="flex flex-col space-y-3 font-semibold text-sm">
              <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="hover:text-muted-foreground">Shop All</Link>
              <Link href="/shop?category=footwear" onClick={() => setMobileMenuOpen(false)} className="hover:text-muted-foreground pl-3 border-l border-border">Footwear</Link>
              <Link href="/shop?category=apparel" onClick={() => setMobileMenuOpen(false)} className="hover:text-muted-foreground pl-3 border-l border-border">Apparel</Link>
              <Link href="/shop?category=electronics" onClick={() => setMobileMenuOpen(false)} className="hover:text-muted-foreground pl-3 border-l border-border">Electronics</Link>
              <Link href="/shop?category=accessories" onClick={() => setMobileMenuOpen(false)} className="hover:text-muted-foreground pl-3 border-l border-border">Accessories</Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="hover:text-muted-foreground">Our Story</Link>
              <Link href="/faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-muted-foreground">FAQs</Link>
              
              {/* Profile/Auth (Mobile) */}
              <div className="border-t border-border pt-3">
                {isAuthenticated ? (
                  <div className="space-y-2.5">
                    <p className="text-xs text-muted-foreground">Logged in as {user?.name}</p>
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block hover:text-muted-foreground">My Profile</Link>
                    {user?.role === 'ADMIN' && (
                      <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="block font-bold text-primary">Admin Dashboard</Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                        router.push('/login');
                      }}
                      className="text-xs font-semibold text-red-600 block"
                    >
                      Log Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full bg-foreground text-background text-center py-2.5 rounded-lg text-sm"
                  >
                    Log In
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Slide-out Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
