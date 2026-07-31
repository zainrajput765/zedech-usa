'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP';

interface Currency {
  code: CurrencyCode;
  symbol: string;
  rate: number; // multiplier from USD
}

const currencies: Record<CurrencyCode, Currency> = {
  USD: { code: 'USD', symbol: '$', rate: 1.0 },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92 },
  GBP: { code: 'GBP', symbol: '£', rate: 0.78 },
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountInUSD: number) => string;
  convertPrice: (amountInUSD: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>(currencies.USD);

  useEffect(() => {
    const saved = localStorage.getItem('currency') as CurrencyCode | null;
    if (saved && currencies[saved]) {
      setCurrencyState(currencies[saved]);
    }
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    if (currencies[code]) {
      setCurrencyState(currencies[code]);
      localStorage.setItem('currency', code);
    }
  };

  const convertPrice = (amountInUSD: number) => {
    return Math.round((amountInUSD * currency.rate) * 100) / 100;
  };

  const formatPrice = (amountInUSD: number) => {
    const converted = convertPrice(amountInUSD);
    return `${currency.symbol}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
  return context;
};
