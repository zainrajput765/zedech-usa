import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { CurrencyProvider } from '../context/CurrencyContext';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'Zedech | Premium eCommerce Platform',
  description: 'Experience minimal luxury and architectural innovation. Discover our latest collections in footwear, apparel, electronics, and lifestyle accessories.',
  keywords: ['eCommerce', 'Nike', 'Apple', 'Zara', 'Shopify', 'Premium Store', 'Footwear', 'Apparel'],
  authors: [{ name: 'Zedech Engineering' }],
  openGraph: {
    title: 'Zedech | Premium eCommerce Platform',
    description: 'Experience minimal luxury and architectural innovation. Shop the new season collections.',
    url: 'https://zedech.com',
    siteName: 'Zedech',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zedech | Premium eCommerce Platform',
    description: 'Experience minimal luxury and architectural innovation. Shop the new season collections.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="h-full flex flex-col antialiased bg-background text-foreground transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <CurrencyProvider>
                <div className="flex flex-col min-h-screen">
                  {children}
                </div>
              </CurrencyProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
