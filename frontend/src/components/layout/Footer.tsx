'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCurrency, CurrencyCode } from '../../context/CurrencyContext';
import { useTheme } from '../../context/ThemeContext';
import { Mail, ArrowRight, Sun, Moon, Globe, Shield, RefreshCw } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  const { currency, setCurrency } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-muted text-foreground border-t border-border mt-auto pt-16 pb-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-10">
        
        {/* Brand column */}
        <div className="md:col-span-2 space-y-6">
          <Link href="/" className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <Logo className="w-8 h-8" />
            <span>ZEDECH</span>
          </Link>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
            Crafting minimal, luxury athletic wear and high-fidelity electronics. Built upon the principles of clean design, user-centered experience, and robust durability.
          </p>
          <div className="flex items-center space-x-4">
            {/* Currency selector */}
            <div className="flex items-center space-x-2 text-xs text-muted-foreground bg-background border border-border px-3 py-1.5 rounded-lg shadow-sm">
              <Globe className="w-3.5 h-3.5" />
              <select
                value={currency.code}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="bg-transparent border-none outline-none cursor-pointer font-medium"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            {/* Theme selector */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-background border border-border text-muted-foreground hover:text-foreground shadow-sm transition-all"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Links Column 1: Shop */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider">Shop</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><Link href="/shop" className="hover:text-foreground transition-colors">All Products</Link></li>
            <li><Link href="/shop?category=footwear" className="hover:text-foreground transition-colors">Footwear</Link></li>
            <li><Link href="/shop?category=apparel" className="hover:text-foreground transition-colors">Apparel</Link></li>
            <li><Link href="/shop?category=electronics" className="hover:text-foreground transition-colors">Electronics</Link></li>
            <li><Link href="/shop?category=accessories" className="hover:text-foreground transition-colors">Accessories</Link></li>
          </ul>
        </div>

        {/* Links Column 2: Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider">Info</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
            <li><Link href="/faq" className="hover:text-foreground transition-colors">FAQs</Link></li>
            <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
            <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Column 3: Newsletter */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider">Newsletter</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Subscribe to receive advanced notifications on exclusive releases, seasonal sales, and design journals.
          </p>
          <form onSubmit={handleSubscribe} className="relative flex items-center">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full bg-background text-foreground border border-border px-4 py-2 rounded-lg text-sm pr-12 focus:outline-none focus:ring-1 focus:ring-ring"
              required
            />
            <button
              type="submit"
              className="absolute right-1 p-1.5 rounded-md bg-foreground text-background hover:bg-muted-foreground transition-colors"
              aria-label="Submit Email"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          {subscribed && (
            <p className="text-xs text-green-600 font-medium">Thank you for subscribing! Check your inbox soon.</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-border mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
        <div>
          &copy; {new Date().getFullYear()} Zedech. All rights reserved.
        </div>
        <div className="flex items-center space-x-6">
          <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> SECURE 256-BIT SSL CHECKOUT</span>
          <span className="flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5" /> EASY 30-DAY RETURNS</span>
        </div>
      </div>
    </footer>
  );
}
