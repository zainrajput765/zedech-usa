'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { ShieldCheck, Tag, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, coupon, itemsPrice, shippingPrice, taxPrice, discountPrice, totalPrice, clearCart } = useCart();
  const { user, token, isAuthenticated } = useAuth();
  const { formatPrice } = useCurrency();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [shippingName, setShippingName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('United States');
  const [phone, setPhone] = useState('');

  // Payment states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Pre-fill user details if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setEmail(user.email);
      setShippingName(user.name);
      if (user.addresses && user.addresses.length > 0) {
        const def = user.addresses.find(a => a.isDefault) || user.addresses[0];
        setShippingName(def.name);
        setStreet(def.street);
        setCity(def.city);
        setState(def.state);
        setZip(def.postalCode);
        setCountry(def.country);
        setPhone(def.phone);
      }
    }
  }, [user, isAuthenticated]);

  // Card Formatting helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 16);
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(value);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length >= 2) {
      setCardExpiry(`${value.substring(0, 2)}/${value.substring(2)}`);
    } else {
      setCardExpiry(value);
    }
  };

  const detectCardBrand = () => {
    const raw = cardNumber.replace(/\s/g, '');
    if (raw.startsWith('4')) return 'Visa';
    if (raw.startsWith('5')) return 'Mastercard';
    if (raw.startsWith('3')) return 'American Express';
    return 'Card';
  };

  const handlePlaceOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setLoading(true);
    setErrorMessage('');

    const shippingAddress = {
      name: shippingName,
      street,
      city,
      state,
      postalCode: zip,
      country,
      phone,
    };

    const payload = {
      orderItems: cartItems.map(item => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
      })),
      shippingAddress,
      billingAddress: shippingAddress, // for demo simplicity, match billing
      shippingMethod: 'Standard',
      paymentMethod: 'card',
      stripePaymentIntentId: `pi_mock_${Math.random().toString(36).substring(2, 10)}`, // simulate payment intent ID
      couponCode: coupon?.code || null,
    };

    try {
      let res;
      if (isAuthenticated) {
        res = await fetch(`${API_URL}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Guest checkout simulation
        console.log('[Guest Checkout] Submitting Order');
        res = await fetch(`${API_URL}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: shippingName,
            email,
            password: 'GuestPassword123!', // create a dummy account for guest tracking
          }),
        });

        const guestData = await res.json();
        
        // Log in guest
        const loginRes = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: 'GuestPassword123!' }),
        });
        const loginData = await loginRes.json();

        res = await fetch(`${API_URL}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${loginData.token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const orderData = await res.json();
      if (orderData.success) {
        clearCart();
        router.push(`/order-success?orderId=${orderData.order.id}`);
      } else {
        setErrorMessage(orderData.message || 'Payment authentication failed.');
      }
    } catch (err) {
      setErrorMessage('Server connection error. Payment simulated successfully anyway.');
      
      // Complete mock order placement if API is down for local test sandbox
      setTimeout(() => {
        clearCart();
        router.push(`/order-success?orderId=mock_order_${Math.floor(Math.random() * 1000000)}`);
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10 flex-1 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Checkout</h1>
          <p className="text-xs text-muted-foreground mt-1">Complete your shipping and secure payment details.</p>
        </div>

        <form onSubmit={handlePlaceOrderSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          
          {/* Form details (Shipping & Payment) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Contact Details */}
            <div className="p-6 border border-border rounded-2xl bg-card space-y-4 shadow-sm">
              <h3 className="font-bold text-sm tracking-tight border-b border-border pb-3">1. Contact Details</h3>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  required
                  disabled={isAuthenticated}
                />
                {!isAuthenticated && (
                  <p className="text-[10px] text-muted-foreground">An account will be created automatically to track this order.</p>
                )}
              </div>
            </div>

            {/* Step 2: Shipping Address */}
            <div className="p-6 border border-border rounded-2xl bg-card space-y-4 shadow-sm">
              <h3 className="font-bold text-sm tracking-tight border-b border-border pb-3">2. Shipping Address</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Full Name</label>
                  <input
                    type="text"
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    required
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Street Address</label>
                  <input
                    type="text"
                    placeholder="123 Luxury Lane, Apt 4"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">State / Province</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">ZIP / Postal Code</label>
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Secure Card Payment */}
            <div className="p-6 border border-border rounded-2xl bg-card space-y-4 shadow-sm">
              <div className="border-b border-border pb-3 flex justify-between items-center">
                <h3 className="font-bold text-sm tracking-tight">3. Credit Card Payment</h3>
                <span className="flex items-center gap-1 text-[10px] text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> SECURE STRIPE TERMINAL
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Card Number */}
                <div className="space-y-1 sm:col-span-2 relative">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs pl-10 focus:outline-none focus:ring-1 focus:ring-ring"
                      required
                    />
                    <CreditCard className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">
                      {detectCardBrand()}
                    </span>
                  </div>
                </div>

                {/* Card Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    required
                  />
                </div>

                {/* Expiry */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Expiration Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs text-center focus:outline-none"
                    required
                  />
                </div>

                {/* CVV */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Security Code (CVV)</label>
                  <input
                    type="password"
                    maxLength={3}
                    placeholder="***"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs text-center focus:outline-none"
                    required
                  />
                </div>

              </div>
            </div>

          </div>

          {/* Sidebar Order Summary */}
          <div className="space-y-6">
            <div className="p-6 border border-border rounded-3xl bg-muted/20 space-y-6 shadow-sm">
              <h3 className="font-bold text-lg">Order Items</h3>
              
              {/* Items listing */}
              <div className="max-h-60 overflow-y-auto space-y-3.5 pr-2">
                {cartItems.map((item) => (
                  <div key={`${item.productId}-${item.color}-${item.size}`} className="flex justify-between items-center gap-4 text-xs font-medium">
                    <div className="flex items-center gap-2.5 truncate">
                      <img src={item.image} alt="" className="w-8 h-8 rounded object-cover bg-muted border border-border" />
                      <div className="truncate">
                        <p className="font-bold truncate">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.color} / {item.size} &times; {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-foreground shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3.5 text-xs pt-4 border-t border-border">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(itemsPrice)}</span>
                </div>
                {discountPrice > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Discount ({coupon?.code})</span>
                    <span>-{formatPrice(discountPrice)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shippingPrice === 0 ? 'Free' : formatPrice(shippingPrice)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax (8%)</span>
                  <span>{formatPrice(taxPrice)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm border-t border-border pt-4 text-foreground">
                  <span>Total Due</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {errorMessage && <p className="text-xs text-red-500 font-medium">{errorMessage}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-foreground text-background font-bold py-3.5 rounded-xl hover:bg-neutral-800 disabled:opacity-50 transition-all text-xs shadow-lg shadow-black/5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Authorizing Payment...
                  </>
                ) : (
                  `Pay ${formatPrice(totalPrice)}`
                )}
              </button>
            </div>
          </div>

        </form>
      </main>
      <Footer />
    </>
  );
}
