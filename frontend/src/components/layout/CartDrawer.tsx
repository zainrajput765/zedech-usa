'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { X, Trash2, Plus, Minus, Tag, ArrowRight, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const {
    cartItems,
    saveForLaterItems,
    coupon,
    couponError,
    availableCoupons,
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

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setLoadingCoupon(true);
    await applyCouponCode(couponInput);
    setLoadingCoupon(false);
    setCouponInput('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Drawer container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-background border-l border-border shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Shopping Cart</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)} items selected
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xl">
                    🛍️
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Your cart is empty</h4>
                    <p className="text-sm text-muted-foreground max-w-xs mt-1">
                      Explore our collections and add items to begin your luxury shopping experience.
                    </p>
                  </div>
                  <Link
                    href="/shop"
                    onClick={onClose}
                    className="bg-foreground text-background text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    Browse Collections
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={`${item.productId}-${item.color}-${item.size}`}
                      className="flex items-start gap-4 p-4 border border-border rounded-xl bg-card hover:shadow-sm transition-all"
                    >
                      {/* Image */}
                      <Link href={`/product/${item.slug}`} onClick={onClose} className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-sm truncate pr-2">
                            <Link href={`/product/${item.slug}`} onClick={onClose} className="hover:underline">
                              {item.name}
                            </Link>
                          </h4>
                          <span className="font-semibold text-sm text-right flex-shrink-0">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Size: {item.size} / Color: {item.color}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity selectors */}
                          <div className="flex items-center border border-border rounded-lg bg-background">
                            <button
                              onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity + 1)}
                              disabled={item.quantity >= item.countInStock}
                              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Save/Delete */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => saveForLater(item)}
                              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              title="Save for Later"
                              aria-label="Save item for later"
                            >
                              <Bookmark className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.productId, item.color, item.size)}
                              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors"
                              title="Delete Item"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Save For Later Section */}
              {saveForLaterItems.length > 0 && (
                <div className="border-t border-border pt-6 space-y-4">
                  <h4 className="font-bold text-sm tracking-tight">Saved For Later ({saveForLaterItems.length})</h4>
                  <div className="space-y-3">
                    {saveForLaterItems.map((item) => (
                      <div
                        key={`later-${item.productId}-${item.color}-${item.size}`}
                        className="flex items-center gap-4 p-3 border border-border border-dashed rounded-xl bg-muted/30"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded-lg bg-muted flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-xs truncate">{item.name}</h5>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{formatPrice(item.price)}</p>
                          <div className="flex items-center space-x-3 mt-1.5">
                            <button
                              onClick={() => moveToCart(item)}
                              className="text-[10px] font-bold text-primary hover:underline"
                            >
                              Move to Cart
                            </button>
                            <button
                              onClick={() => removeFromSaveForLater(item.productId, item.color, item.size)}
                              className="text-[10px] text-muted-foreground hover:text-red-500"
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

            {/* Calculations & Checkout */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-border bg-muted/30 space-y-4">
                {/* Coupon Code Panel */}
                {coupon ? (
                  <div className="flex justify-between items-center bg-green-500/10 text-green-600 border border-green-500/20 px-3.5 py-2.5 rounded-xl text-sm">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Tag className="w-4 h-4" /> Code {coupon.code} Applied
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
                      placeholder="Promo code (e.g. WELCOME10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 bg-background border border-border px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-ring"
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
                {!coupon && availableCoupons && availableCoupons.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Available Coupons (Click to apply)</p>
                    <div className="flex flex-wrap gap-1.5">
                      {availableCoupons.map((c: any) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => applyCouponCode(c.code)}
                          className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 hover:bg-indigo-500/25 text-[10px] font-bold px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {c.code} ({c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `$${c.discountValue}`} off)
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary breakdown */}
                <div className="space-y-2.5 text-sm pt-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(itemsPrice)}</span>
                  </div>
                  {discountPrice > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
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
                  <div className="flex justify-between font-bold text-base border-t border-border pt-3">
                    <span>Total</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                {/* Actions */}
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 bg-foreground text-background font-bold py-3.5 rounded-xl hover:bg-neutral-800 shadow-lg shadow-black/5 transition-all text-sm"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                  Taxes and shipping are calculated at checkout. Backed by our 30-day money-back guarantee.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
