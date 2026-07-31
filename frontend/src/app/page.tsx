'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { ArrowRight, ShoppingBag, Eye, Heart, Star, Shield, HelpCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const FALLBACK_HERO = {
  slides: [
    {
      title: 'Designed for the Future',
      subtitle: 'Experience minimal luxury and athletic innovation.',
      buttonText: 'Shop Footwear',
      buttonLink: '/shop?category=footwear',
      backgroundImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&auto=format&fit=crop&q=80',
    },
    {
      title: 'Sleek Aesthetic Wear',
      subtitle: 'Elevate your daily wardrobe with minimal structures.',
      buttonText: 'Explore Apparel',
      buttonLink: '/shop?category=apparel',
      backgroundImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=1600&auto=format&fit=crop&q=80',
    },
    {
      title: 'Studio-Grade Sound',
      subtitle: 'Immersive headphones with active noise cancellation.',
      buttonText: 'Shop Audio',
      buttonLink: '/product/studio-max-anc-headphones',
      backgroundImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80',
    }
  ]
};

const FALLBACK_PRODUCTS = [
  {
    id: '1',
    name: 'Apex Pro Runner',
    slug: 'apex-pro-runner',
    brand: 'Nike',
    price: 180.00,
    originalPrice: 220.00,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80'],
    ratings: 4.5,
    isNew: true,
    isBestSeller: true,
  },
  {
    id: '2',
    name: 'AeroShield Windbreaker',
    slug: 'aeroshield-windbreaker',
    brand: 'Nike',
    price: 95.00,
    originalPrice: 120.00,
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80'],
    ratings: 4.0,
    isNew: false,
    isBestSeller: false,
  },
  {
    id: '3',
    name: 'Studio-Max ANC Headphones',
    slug: 'studio-max-anc-headphones',
    brand: 'Apple',
    price: 349.00,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'],
    ratings: 5.0,
    isNew: true,
    isBestSeller: true,
  },
  {
    id: '4',
    name: 'Horizon Smart Watch V2',
    slug: 'horizon-smart-watch-v2',
    brand: 'Apple',
    price: 299.00,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'],
    ratings: 4.2,
    isNew: false,
    isBestSeller: true,
  }
];

export default function HomePage() {
  const { formatPrice } = useCurrency();
  const { addToCart, addToWishlist, isInWishlist, removeFromWishlist } = useCart();

  const [heroData, setHeroData] = useState(FALLBACK_HERO);
  const [products, setProducts] = useState<any[]>(FALLBACK_PRODUCTS);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroData.slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroData]);

  // Load products and CMS
  useEffect(() => {
    const loadData = async () => {
      try {
        const prodRes = await fetch(`${API_URL}/products?limit=8`);
        const prodData = await prodRes.json();
        if (prodData.success && prodData.products.length > 0) {
          setProducts(prodData.products);
        }

        const cmsRes = await fetch(`${API_URL}/cms/homepage_hero`);
        const cmsData = await cmsRes.json();
        if (cmsData.success && cmsData.value?.slides) {
          setHeroData(cmsData.value);
        }
      } catch (err) {
        console.warn('API offline, falling back to static presentation data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const toggleWishlist = (product: any) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        slug: product.slug,
      });
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1 pb-20">
        
        {/* Hero Banner Slider */}
        <section className="relative h-[85vh] w-full overflow-hidden bg-neutral-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0.8, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.8 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.6) 100%), url(${heroData.slides[currentSlide].backgroundImage})` }}
            />
          </AnimatePresence>

          {/* Slide Text */}
          <div className="absolute inset-0 flex items-end pb-24 px-6 md:px-12 max-w-7xl mx-auto z-10">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-xl text-white space-y-4"
            >
              <span className="text-xs uppercase font-bold tracking-widest text-neutral-300">Zedech Release</span>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{heroData.slides[currentSlide].title}</h1>
              <p className="text-sm md:text-base text-neutral-200 leading-relaxed font-light">{heroData.slides[currentSlide].subtitle}</p>
              <div className="pt-2">
                <Link
                  href={heroData.slides[currentSlide].buttonLink}
                  className="inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-6 py-3 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  {heroData.slides[currentSlide].buttonText} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Slide Indicators */}
          <div className="absolute right-6 md:right-12 bottom-12 flex space-x-2 z-10">
            {heroData.slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </section>

        {/* Value Propositions */}
        <section className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl">📦</div>
            <div>
              <h3 className="text-sm font-bold">Complimentary Shipping</h3>
              <p className="text-xs text-muted-foreground mt-1">Free standard courier dispatching on orders exceeding $150.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl">🔒</div>
            <div>
              <h3 className="text-sm font-bold">256-Bit Encrypted Payments</h3>
              <p className="text-xs text-muted-foreground mt-1">Direct tokenized card checkouts supported by Stripe and PayPal.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl">🔄</div>
            <div>
              <h3 className="text-sm font-bold">Simple 30-Day Returns</h3>
              <p className="text-xs text-muted-foreground mt-1">Initiate returns online from your dashboard for full, instant refunds.</p>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="max-w-7xl mx-auto px-6 py-12 space-y-8">
          <div className="flex justify-between items-end border-b border-border pb-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Curated Picks</span>
              <h2 className="text-2xl font-bold tracking-tight mt-0.5">Featured Products</h2>
            </div>
            <Link href="/shop" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              Shop Collections <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => {
              const wishlist = isInWishlist(product.id);
              return (
                <div
                  key={product.id}
                  className="group relative border border-border rounded-2xl overflow-hidden bg-card hover:shadow-lg transition-all duration-300"
                >
                  {/* Photo container */}
                  <div className="relative aspect-square w-full bg-muted overflow-hidden">
                    <Link href={`/product/${product.slug}`}>
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    {/* Quick Add buttons */}
                    <button
                      onClick={() => toggleWishlist(product)}
                      className={`absolute top-4 right-4 p-2 rounded-full shadow-md transition-colors ${wishlist ? 'bg-red-500 text-white' : 'bg-background text-muted-foreground hover:text-foreground'}`}
                      aria-label="Add to wishlist"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>

                    {product.originalPrice && (
                      <span className="absolute top-4 left-4 bg-foreground text-background text-[10px] uppercase font-bold px-2.5 py-1 rounded-full">
                        Sale
                      </span>
                    )}
                  </div>

                  {/* Body details */}
                  <div className="p-5 space-y-1">
                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                    <h3 className="font-semibold text-sm truncate">
                      <Link href={`/product/${product.slug}`} className="hover:underline">
                        {product.name}
                      </Link>
                    </h3>

                    {/* Ratings */}
                    <div className="flex items-center space-x-1 pt-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 stroke-none" />
                      <span className="text-xs font-semibold">{product.ratings.toFixed(1)}</span>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-baseline space-x-2 pt-2">
                      <span className="text-sm font-bold text-foreground">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="pt-4 flex gap-2">
                      <button
                        onClick={() => addToCart({
                          productId: product.id,
                          name: product.name,
                          price: product.price,
                          color: product.colors?.[0] || 'Default',
                          size: product.sizes?.[0] || 'One Size',
                          image: product.images[0],
                          slug: product.slug,
                          countInStock: product.countInStock || 10,
                        })}
                        className="flex-1 bg-foreground text-background text-xs font-semibold py-2 rounded-lg hover:bg-neutral-800 transition-colors"
                      >
                        Add to Cart
                      </button>
                      <Link
                        href={`/product/${product.slug}`}
                        className="bg-muted hover:bg-border text-foreground p-2 rounded-lg transition-colors flex items-center justify-center"
                        title="View Details"
                        aria-label={`View ${product.name} details`}
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Editorial Promotion Banners (Apple / Nike Inspired) */}
        <section className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Box 1 */}
          <div
            className="h-[460px] rounded-3xl bg-cover bg-center relative p-8 flex flex-col justify-end text-white overflow-hidden group shadow-md"
            style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&auto=format&fit=crop&q=80)' }}
          >
            <div className="space-y-3 z-10">
              <span className="text-xs uppercase font-bold tracking-widest text-neutral-300">Engineering</span>
              <h3 className="text-2xl font-bold">The Apex Performance Run</h3>
              <p className="text-xs text-neutral-200 leading-relaxed font-light max-w-sm">
                Built with reactive carbon fiber plates and proprietary foam constructs for maximum pacing efficiency.
              </p>
              <Link
                href="/product/apex-pro-runner"
                className="inline-flex items-center gap-1.5 text-xs font-bold hover:underline"
              >
                Learn More <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Box 2 */}
          <div
            className="h-[460px] rounded-3xl bg-cover bg-center relative p-8 flex flex-col justify-end text-white overflow-hidden group shadow-md"
            style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80)' }}
          >
            <div className="space-y-3 z-10">
              <span className="text-xs uppercase font-bold tracking-widest text-neutral-300">Acoustics</span>
              <h3 className="text-2xl font-bold">Studio ANC Comfort</h3>
              <p className="text-xs text-neutral-200 leading-relaxed font-light max-w-sm">
                Active noise cancellation technology that isolates ambient frequencies. Hand-cut anodized aluminum cups.
              </p>
              <Link
                href="/product/studio-max-anc-headphones"
                className="inline-flex items-center gap-1.5 text-xs font-bold hover:underline"
              >
                Learn More <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-muted py-16 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Endorsements</span>
              <h2 className="text-2xl font-bold mt-1">What our customers say</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-background rounded-2xl border border-border shadow-sm text-left space-y-4">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 stroke-none" />)}
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "The quality of the wool trench coat is phenomenal. It fits perfectly, feels heavy and luxurious, and has that beautiful Zara structure. Absolute masterpiece."
                </p>
                <div>
                  <h4 className="text-sm font-bold">Marcus Vance</h4>
                  <p className="text-xs text-muted-foreground">New York, NY</p>
                </div>
              </div>
              <div className="p-8 bg-background rounded-2xl border border-border shadow-sm text-left space-y-4">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 stroke-none" />)}
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "These headphones have changed my remote office life. The noise cancellation completely silences construction noise from outside. Soundstage is wide and detailed."
                </p>
                <div>
                  <h4 className="text-sm font-bold">Sarah Jenkins</h4>
                  <p className="text-xs text-muted-foreground">San Francisco, CA</p>
                </div>
              </div>
              <div className="p-8 bg-background rounded-2xl border border-border shadow-sm text-left space-y-4">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 stroke-none" />)}
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "Sleekest, most minimal wallet I have owned. Hands down. Craftsmanship is top tier, leather has developed a beautiful dark patina after just a month."
                </p>
                <div>
                  <h4 className="text-sm font-bold">David Choi</h4>
                  <p className="text-xs text-muted-foreground">Chicago, IL</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
