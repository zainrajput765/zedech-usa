'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
  image: string;
  slug: string;
  countInStock: number;
  shippingPrice?: number;
  taxRate?: number;
}

export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  slug: string;
}

export interface CouponData {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';
  discountValue: number;
}

interface CartContextType {
  cartItems: CartItem[];
  saveForLaterItems: CartItem[];
  wishlistItems: WishlistItem[];
  coupon: CouponData | null;
  couponError: string | null;
  availableCoupons: any[];
  
  // Cart operations
  addToCart: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  removeFromCart: (productId: string, color: string, size: string) => void;
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  
  // Save for Later operations
  saveForLater: (item: CartItem) => void;
  moveToCart: (item: CartItem) => void;
  removeFromSaveForLater: (productId: string, color: string, size: string) => void;

  // Wishlist operations
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  moveWishlistToCart: (item: WishlistItem, color?: string, size?: string) => void;

  // Coupon operations
  applyCouponCode: (code: string) => Promise<boolean>;
  removeCoupon: () => void;

  // Price Totals
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  discountPrice: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [saveForLaterItems, setSaveForLaterItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [coupon, setCoupon] = useState<CouponData | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [activeToast, setActiveToast] = useState<{
    id: string;
    name: string;
    image: string;
    price: number;
  } | null>(null);

  // Dynamic store tax & shipping parameters from CMS
  const [taxRate, setTaxRate] = useState<number>(8);
  const [shippingFee, setShippingFee] = useState<number>(15);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(150);

  // Load from local storage and fetch CMS rules
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedSaveLater = localStorage.getItem('save_later');
    const savedWishlist = localStorage.getItem('wishlist');
    const savedCoupon = localStorage.getItem('coupon');

    if (savedCart) setCartItems(JSON.parse(savedCart));
    if (savedSaveLater) setSaveForLaterItems(JSON.parse(savedSaveLater));
    if (savedWishlist) setWishlistItems(JSON.parse(savedWishlist));
    if (savedCoupon) setCoupon(JSON.parse(savedCoupon));

    // Fetch dynamic tax & shipping rules from database CMS
    const fetchPricingRules = async () => {
      try {
        const res = await fetch(`${API_URL}/cms/store_pricing_rules`);
        const data = await res.json();
        if (data.success && data.value) {
          setTaxRate(Number(data.value.taxRate) ?? 8);
          setShippingFee(Number(data.value.shippingFee) ?? 15);
          setFreeShippingThreshold(Number(data.value.freeShippingThreshold) ?? 150);
        }
      } catch (err) {
        console.warn('Store pricing rules CMS setting not found. Using defaults.');
      }
    };

    const fetchActiveCoupons = async () => {
      try {
        const res = await fetch(`${API_URL}/coupons`);
        const data = await res.json();
        if (data.success) {
          setAvailableCoupons(data.coupons || []);
        }
      } catch (err) {
        console.warn('Failed to fetch coupons list.');
      }
    };

    fetchPricingRules();
    fetchActiveCoupons();
  }, []);

  // Auto dismiss toast after 3 seconds
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  // Save to local storage helpers
  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem('cart', JSON.stringify(items));
  };

  const saveSaveLater = (items: CartItem[]) => {
    setSaveForLaterItems(items);
    localStorage.setItem('save_later', JSON.stringify(items));
  };

  const saveWishlist = (items: WishlistItem[]) => {
    setWishlistItems(items);
    localStorage.setItem('wishlist', JSON.stringify(items));
  };

  // --- Cart Actions ---

  const addToCart = (item: Omit<CartItem, 'quantity'>, qty: number = 1) => {
    const existItem = cartItems.find(
      (x) => x.productId === item.productId && x.color === item.color && x.size === item.size
    );

    if (existItem) {
      const newQty = Math.min(existItem.quantity + qty, item.countInStock);
      saveCart(
        cartItems.map((x) =>
          x.productId === item.productId && x.color === item.color && x.size === item.size
            ? { ...x, quantity: newQty }
            : x
        )
      );
    } else {
      saveCart([...cartItems, { ...item, quantity: qty }]);
    }

    // Trigger toast notification
    setActiveToast({
      id: Math.random().toString(36).substring(2, 9),
      name: item.name,
      image: item.image,
      price: item.price,
    });
  };

  const removeFromCart = (productId: string, color: string, size: string) => {
    saveCart(
      cartItems.filter((x) => !(x.productId === productId && x.color === color && x.size === size))
    );
  };

  const updateQuantity = (productId: string, color: string, size: string, quantity: number) => {
    saveCart(
      cartItems.map((x) =>
        x.productId === productId && x.color === color && x.size === size
          ? { ...x, quantity: Math.max(1, quantity) }
          : x
      )
    );
  };

  const clearCart = () => {
    saveCart([]);
    removeCoupon();
  };

  // --- Save For Later Actions ---

  const saveForLater = (item: CartItem) => {
    // 1. Remove from cart
    removeFromCart(item.productId, item.color, item.size);
    // 2. Add to Save for later (if not already there)
    const exists = saveForLaterItems.find(
      (x) => x.productId === item.productId && x.color === item.color && x.size === item.size
    );
    if (!exists) {
      saveSaveLater([...saveForLaterItems, item]);
    }
  };

  const moveToCart = (item: CartItem) => {
    // 1. Remove from Save for later
    removeFromSaveForLater(item.productId, item.color, item.size);
    // 2. Add to Cart
    addToCart(item, item.quantity);
  };

  const removeFromSaveForLater = (productId: string, color: string, size: string) => {
    saveSaveLater(
      saveForLaterItems.filter((x) => !(x.productId === productId && x.color === color && x.size === size))
    );
  };

  // --- Wishlist Actions ---

  const addToWishlist = (item: WishlistItem) => {
    const exists = wishlistItems.find((x) => x.productId === item.productId);
    if (!exists) {
      saveWishlist([...wishlistItems, item]);
    }
  };

  const removeFromWishlist = (productId: string) => {
    saveWishlist(wishlistItems.filter((x) => x.productId !== productId));
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((x) => x.productId === productId);
  };

  const moveWishlistToCart = (item: WishlistItem, color: string = 'Default', size: string = 'One Size') => {
    removeFromWishlist(item.productId);
    addToCart({
      productId: item.productId,
      name: item.name,
      price: item.price,
      color,
      size,
      image: item.image,
      slug: item.slug,
      countInStock: 10,
      shippingPrice: 0,
      taxRate: 0,
    });
  };

  // --- Coupon Actions ---

  const applyCouponCode = async (code: string) => {
    setCouponError(null);
    try {
      const res = await fetch(`${API_URL}/coupons/${code.toUpperCase().trim()}`);
      const data = await res.json();
      
      if (data.success) {
        setCoupon(data.coupon);
        localStorage.setItem('coupon', JSON.stringify(data.coupon));
        return true;
      } else {
        setCouponError(data.message || 'Invalid coupon code');
        return false;
      }
    } catch (err) {
      setCouponError('Failed to validate coupon.');
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponError(null);
    localStorage.removeItem('coupon');
  };

  // --- Calculations ---

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Strictly use the global CMS shipping rules (ignores product-specific shipping fees)
  const shippingPrice = itemsPrice >= freeShippingThreshold || itemsPrice === 0 ? 0 : shippingFee;

  // Strictly use the global CMS tax rate (ignores product-specific tax rates)
  const taxPrice = Math.round((itemsPrice * (taxRate / 100)) * 100) / 100;

  let discountPrice = 0;
  if (coupon) {
    if (coupon.discountType === 'PERCENTAGE') {
      discountPrice = Math.round((itemsPrice * (coupon.discountValue / 100)) * 100) / 100;
    } else if (coupon.discountType === 'FIXED') {
      discountPrice = Math.min(coupon.discountValue, itemsPrice);
    } else if (coupon.discountType === 'FREE_SHIPPING') {
      discountPrice = shippingPrice;
    }
  }

  const totalPrice = Math.max(0, Math.round((itemsPrice + shippingPrice + taxPrice - discountPrice) * 100) / 100);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        saveForLaterItems,
        wishlistItems,
        coupon,
        couponError,
        availableCoupons,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        saveForLater,
        moveToCart,
        removeFromSaveForLater,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        moveWishlistToCart,
        applyCouponCode,
        removeCoupon,
        itemsPrice,
        shippingPrice,
        taxPrice,
        discountPrice,
        totalPrice,
      }}
    >
      {children}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed top-6 right-6 z-[9999] max-w-sm w-[340px] bg-background/95 backdrop-blur border border-border shadow-2xl rounded-2xl p-4 flex gap-3.5 items-center justify-between"
          >
            <div className="flex gap-3 items-center min-w-0">
              <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex-shrink-0 border border-border">
                <img src={activeToast.image} alt={activeToast.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-green-600 bg-green-500/10 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  ✓ Added to Cart
                </span>
                <h4 className="text-xs font-bold text-foreground truncate">{activeToast.name}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">${activeToast.price.toFixed(2)}</p>
              </div>
            </div>
            
            <button
              onClick={() => setActiveToast(null)}
              className="text-[10px] font-extrabold uppercase bg-foreground text-background px-3 py-2 rounded-lg hover:bg-neutral-800 transition-colors flex-shrink-0 cursor-pointer"
            >
              Okay
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
