'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

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

  // Load from local storage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedSaveLater = localStorage.getItem('save_later');
    const savedWishlist = localStorage.getItem('wishlist');
    const savedCoupon = localStorage.getItem('coupon');

    if (savedCart) setCartItems(JSON.parse(savedCart));
    if (savedSaveLater) setSaveForLaterItems(JSON.parse(savedSaveLater));
    if (savedWishlist) setWishlistItems(JSON.parse(savedWishlist));
    if (savedCoupon) setCoupon(JSON.parse(savedCoupon));
  }, []);

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
  const shippingPrice = itemsPrice >= 150 || itemsPrice === 0 ? 0 : 15;
  const taxPrice = Math.round((itemsPrice * 0.08) * 100) / 100;

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
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
