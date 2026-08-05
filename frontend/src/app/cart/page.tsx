'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Trash2, Plus, Minus, Tag, ArrowRight, Bookmark, ArrowLeft } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function CartPage() {
  const {
    cartItems,
    saveForLaterItems,
    coupon,
    couponError,
    removeFromCart,
    updateQuantity,
    saveForLater,
    moveToCart,
    removeFromSaveForLater,
    applyCouponCode,
    removeCoupon,
    itemsPrice,
    shippingPrice,
    taxPrice,
    discountPrice,
    totalPrice,
  } = useCart();

  const { formatPrice } = useCurrency();
  const [couponInput, setCouponInput] = useState('');
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

  // Load available coupons on mount
  React.useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await fetch(`${API_URL}/coupons`);
        const data = await res.json();
        if (data.success) {
          setAvailableCoupons(data.coupons || []);
        }
      } catch (err) {
        console.error('Error fetching store coupons', err);
      }
    };
    fetchCoupons();
  }, []);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setLoadingCoupon(true);
    await applyCouponCode(couponInput);
    setLoadingCoupon(false);
    setCouponInput('');
  };

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10 flex-1 space-y-10">
        
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Shopping Bag</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Review and adjust your selected items before proceeding to checkout.
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="h-96 border border-border border-dashed rounded-3xl flex flex-col justify-center items-center text-center space-y-4 px-6">
            <div className="text-3xl">🛒</div>
            <h3 className="font-bold text-lg">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Discover minimal luxury items in our catalogue and add them to your cart.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-foreground text-background text-sm font-semibold px-6 py-3 rounded-lg hover:bg-neutral-800 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            
            {/* Items List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={`${item.productId}-${item.color}-${item.size}`}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 border border-border rounded-2xl bg-card hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-4">
                      {/* Product image */}
                      <Link href={`/product/${item.slug}`} className="w-20 h-20 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      {/* Brand & Name */}
                      <div>
                        <h3 className="font-semibold text-sm">
                          <Link href={`/product/${item.slug}`} className="hover:underline">
                            {item.name}
                          </Link>
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Size: <span className="text-foreground font-medium">{item.size}</span> / Color: <span className="text-foreground font-medium">{item.color}</span>
                        </p>
                        
                        <div className="flex items-center space-x-4 mt-3">
                          <button
                            onClick={() => saveForLater(item)}
                            className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-all"
                          >
                            <Bookmark className="w-3.5 h-3.5" /> Save for Later
                          </button>
                          <button
                            onClick={() => removeFromCart(item.productId, item.color, item.size)}
                            className="flex items-center gap-1 text-[10px] font-bold text-red-500 hover:text-red-600 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-border">
                      {/* Quantity selection */}
                      <div className="flex items-center border border-border rounded-lg bg-background">
                        <button
                          onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity + 1)}
                          disabled={item.quantity >= item.countInStock}
                          className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <span className="font-bold text-sm text-foreground">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{formatPrice(item.price)} each</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Save For Later Shelf */}
              {saveForLaterItems.length > 0 && (
                <div className="border-t border-border pt-10 space-y-6">
                  <div>
                    <h2 className="font-bold text-lg">Saved for Later</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Items you queued to purchase at a later date.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {saveForLaterItems.map((item) => (
                      <div
                        key={`later-${item.productId}-${item.color}-${item.size}`}
                        className="flex items-center gap-4 p-4 border border-border border-dashed rounded-2xl bg-muted/20"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-xl bg-muted"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs truncate">{item.name}</h4>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{formatPrice(item.price)}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <button
                              onClick={() => moveToCart(item)}
                              className="text-[10px] font-bold text-primary hover:underline"
                            >
                              Move to Cart
                            </button>
                            <button
                              onClick={() => removeFromSaveForLater(item.productId, item.color, item.size)}
                              className="text-[10px] font-bold text-red-500 hover:text-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Checkout Pricing Panel */}
            <div className="p-6 border border-border rounded-3xl bg-muted/20 space-y-6 shadow-sm">
              <h3 className="font-bold text-lg">Order Summary</h3>

              {/* Coupon Form */}
              {coupon ? (
                <div className="flex justify-between items-center bg-green-500/10 text-green-600 border border-green-500/20 px-3.5 py-2.5 rounded-xl text-xs">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Tag className="w-3.5 h-3.5" /> Coupon: {coupon.code} Applied
                  </span>
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 bg-background border border-border px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <button
                    type="submit"
                    disabled={loadingCoupon}
                    className="bg-foreground text-background text-xs font-semibold px-4 rounded-xl hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-xs text-red-500 font-medium px-1">{couponError}</p>}

              {/* Available Coupons list */}
              {availableCoupons.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Available Store Coupons</h4>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {availableCoupons.map((c) => {
                      const isFinished = c.maxUses && c.usedCount >= c.maxUses;
                      return (
                        <div 
                          key={c.id} 
                          className={`p-2.5 border rounded-xl flex items-center justify-between text-xs transition-all ${isFinished ? 'bg-muted/30 border-border/40 opacity-60' : 'bg-background border-border hover:border-foreground/20'}`}
                        >
                          <div className="min-w-0">
                            <span className="font-extrabold text-foreground tracking-tight">{c.code}</span>
                            <p className="text-[9px] text-muted-foreground mt-0.5">
                              {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% Off` : `$${c.discountValue} Off`}
                              {c.maxUses && ` • Limit: ${c.usedCount}/${c.maxUses}`}
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={isFinished || (coupon?.code === c.code)}
                            onClick={() => applyCouponCode(c.code)}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${isFinished ? 'border-transparent text-muted-foreground bg-muted/60' : (coupon?.code === c.code) ? 'border-transparent text-green-600 bg-green-500/10' : 'border-foreground text-foreground hover:bg-foreground hover:text-background'}`}
                          >
                            {isFinished ? 'Ended' : (coupon?.code === c.code) ? 'Applied' : 'Claim'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-3.5 text-xs pt-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(itemsPrice)}</span>
                </div>
                {discountPrice > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Discount</span>
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
                  <span>Estimated Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {/* Actions */}
              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 bg-foreground text-background font-bold py-3.5 rounded-xl hover:bg-neutral-800 shadow-lg shadow-black/5 transition-all text-xs"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex flex-col gap-2.5 text-[10px] text-muted-foreground leading-relaxed text-center">
                <p>Enjoy free delivery on all orders exceeding $150.</p>
                <p>Easy returns within 30 days of delivery receipt.</p>
              </div>
            </div>

          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
