'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useCurrency } from '../../context/CurrencyContext';
import { useCart } from '../../context/CartContext';
import { Star, Filter, SlidersHorizontal, Heart, Eye, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const MOCK_PRODUCTS = [
  { id: '1', name: 'Apex Pro Runner', slug: 'apex-pro-runner', brand: 'Nike', price: 180.0, originalPrice: 220.0, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80'], ratings: 4.5, colors: ['Neon Red', 'Stealth Black'], sizes: ['US 8', 'US 9', 'US 10'], isNew: true },
  { id: '2', name: 'AeroShield Windbreaker', slug: 'aeroshield-windbreaker', brand: 'Nike', price: 95.0, originalPrice: 120.0, images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80'], ratings: 4.0, colors: ['Charcoal Gray', 'White'], sizes: ['M', 'L'], isNew: false },
  { id: '3', name: 'Studio-Max ANC Headphones', slug: 'studio-max-anc-headphones', brand: 'Apple', price: 349.0, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'], ratings: 5.0, colors: ['Space Gray', 'Silver'], sizes: ['One Size'], isNew: true },
  { id: '4', name: 'Horizon Smart Watch V2', slug: 'horizon-smart-watch-v2', brand: 'Apple', price: 299.0, images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'], ratings: 4.2, colors: ['Gold', 'Space Black'], sizes: ['45mm'], isNew: false },
  { id: '5', name: 'Tailored Wool Trench Coat', slug: 'tailored-wool-trench-coat', brand: 'Zara', price: 220.0, images: ['https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80'], ratings: 4.6, colors: ['Camel Brown', 'Navy Blue'], sizes: ['S', 'M', 'L'], isNew: true },
  { id: '6', name: 'Minimalist Leather Cardholder', slug: 'minimalist-leather-cardholder', brand: 'Zara', price: 45.0, originalPrice: 55.0, images: ['https://images.unsplash.com/photo-1627124424074-7227c2c0bdc5?w=600&auto=format&fit=crop&q=80'], ratings: 4.8, colors: ['Cognac Brown', 'Midnight Black'], sizes: ['One Size'], isNew: false }
];

const MOCK_CATEGORIES = [
  { id: '1', name: 'Footwear', slug: 'footwear' },
  { id: '2', name: 'Apparel', slug: 'apparel' },
  { id: '3', name: 'Electronics', slug: 'electronics' },
  { id: '4', name: 'Accessories', slug: 'accessories' }
];

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatPrice } = useCurrency();
  const { addToCart, addToWishlist, isInWishlist, removeFromWishlist } = useCart();

  // Search Param states
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';

  // Filter states
  const [products, setProducts] = useState<any[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<any[]>(MOCK_CATEGORIES);
  const [brands, setBrands] = useState<string[]>(['Nike', 'Apple', 'Zara']);
  const [colors, setColors] = useState<string[]>(['Neon Red', 'Stealth Black', 'Charcoal Gray', 'White', 'Space Gray', 'Silver', 'Gold', 'Camel Brown', 'Cognac Brown', 'Midnight Black']);
  const [sizes, setSizes] = useState<string[]>(['US 8', 'US 9', 'US 10', 'S', 'M', 'L', 'One Size', '45mm']);

  // Active filters
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeSearch, setActiveSearch] = useState(initialSearch);
  const [activeBrand, setActiveBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [activeRating, setActiveRating] = useState<number | null>(null);
  const [activeColor, setActiveColor] = useState('');
  const [activeSize, setActiveSize] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Sync route parameters
  useEffect(() => {
    setActiveCategory(searchParams.get('category') || '');
    setActiveSearch(searchParams.get('search') || '');
    setCurrentPage(1);
  }, [searchParams]);

  // Load categories and metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const catRes = await fetch(`${API_URL}/products/categories`);
        const catData = await catRes.json();
        if (catData.success && catData.categories.length > 0) {
          setCategories(catData.categories);
        }

        const filterRes = await fetch(`${API_URL}/products/filters`);
        const filterData = await filterRes.json();
        if (filterData.success) {
          if (filterData.brands.length > 0) setBrands(filterData.brands);
          if (filterData.colors.length > 0) setColors(filterData.colors);
          if (filterData.sizes.length > 0) setSizes(filterData.sizes);
        }
      } catch (err) {
        console.warn('API metadata offline, loading client mocks.');
      }
    };
    fetchMetadata();
  }, []);

  // Fetch product listings
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `${API_URL}/products?page=${currentPage}&limit=8&sort=${sortBy}`;
        if (activeCategory) url += `&category=${activeCategory}`;
        if (activeSearch) url += `&search=${encodeURIComponent(activeSearch)}`;
        if (activeBrand) url += `&brand=${activeBrand}`;
        if (minPrice) url += `&minPrice=${minPrice}`;
        if (maxPrice) url += `&maxPrice=${maxPrice}`;
        if (activeRating) url += `&rating=${activeRating}`;
        if (activeColor) url += `&color=${activeColor}`;
        if (activeSize) url += `&size=${activeSize}`;

        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setProducts(data.products);
          setTotalPages(data.pagination.totalPages || 1);
        }
      } catch (err) {
        console.warn('Products endpoint offline, running simulation filters on local mock.');
        let filtered = [...MOCK_PRODUCTS];

        if (activeCategory) {
          filtered = filtered.filter(p => {
            const cat = MOCK_CATEGORIES.find(c => c.slug === activeCategory);
            return p.id === '1' && cat?.name === 'Footwear' ||
                   p.id === '2' && cat?.name === 'Apparel' ||
                   p.id === '3' && cat?.name === 'Electronics' ||
                   p.id === '4' && cat?.name === 'Electronics' ||
                   p.id === '5' && cat?.name === 'Apparel' ||
                   p.id === '6' && cat?.name === 'Accessories';
          });
        }
        if (activeSearch) {
          filtered = filtered.filter(p => p.name.toLowerCase().includes(activeSearch.toLowerCase()));
        }
        if (activeBrand) {
          filtered = filtered.filter(p => p.brand.toLowerCase() === activeBrand.toLowerCase());
        }
        if (minPrice) {
          filtered = filtered.filter(p => p.price >= Number(minPrice));
        }
        if (maxPrice) {
          filtered = filtered.filter(p => p.price <= Number(maxPrice));
        }
        if (activeRating) {
          filtered = filtered.filter(p => p.ratings >= activeRating);
        }
        if (activeColor) {
          filtered = filtered.filter(p => p.colors?.includes(activeColor));
        }
        if (activeSize) {
          filtered = filtered.filter(p => p.sizes?.includes(activeSize));
        }

        // Sorting
        if (sortBy === 'price_asc') filtered.sort((a,b) => a.price - b.price);
        if (sortBy === 'price_desc') filtered.sort((a,b) => b.price - a.price);

        setProducts(filtered);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory, activeSearch, activeBrand, minPrice, maxPrice, activeRating, activeColor, activeSize, sortBy, currentPage]);

  const clearAllFilters = () => {
    setActiveCategory('');
    setActiveBrand('');
    setMinPrice('');
    setMaxPrice('');
    setActiveRating(null);
    setActiveColor('');
    setActiveSize('');
    setSortBy('newest');
    router.push('/shop');
  };

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
      <main className="max-w-7xl mx-auto px-6 py-10 flex-1">
        
        {/* Title banner */}
        <div className="mb-8 border-b border-border pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Catalogue</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Showing {products.length} products
              {activeSearch && ` matching "${activeSearch}"`}
              {activeCategory && ` in ${activeCategory}`}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Sorting */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-card border border-border px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm focus:outline-none"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="best_selling">Best Selling</option>
              <option value="top_rated">Highest Rated</option>
            </select>

            {/* Mobile Filter toggle */}
            <button
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
              className="lg:hidden flex items-center justify-center gap-1.5 bg-foreground text-background text-xs font-semibold px-4 py-2 rounded-lg"
            >
              <Filter className="w-3.5 h-3.5" /> Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filters (Desktop) */}
          <aside className={`lg:block ${showMobileSidebar ? 'fixed inset-0 bg-background z-50 p-6 overflow-y-auto' : 'hidden'} space-y-6 lg:relative lg:p-0 lg:bg-transparent lg:z-auto`}>
            <div className="flex justify-between items-center border-b border-border pb-4 lg:hidden">
              <h3 className="font-bold text-lg">Filters</h3>
              <button onClick={() => setShowMobileSidebar(false)} className="text-sm font-semibold hover:underline">Close</button>
            </div>

            {/* Clear All */}
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm tracking-tight hidden lg:block">Filters</h3>
              <button
                onClick={clearAllFilters}
                className="text-xs text-muted-foreground hover:text-foreground font-semibold underline"
              >
                Clear All
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-2 border-b border-border pb-4 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Categories</h4>
              <div className="space-y-1.5">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveCategory(activeCategory === c.slug ? '' : c.slug);
                      setShowMobileSidebar(false);
                    }}
                    className={`block w-full text-left text-sm py-1 font-medium transition-colors ${activeCategory === c.slug ? 'text-primary font-bold border-l-2 border-primary pl-2' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2 border-b border-border pb-4 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Brands</h4>
              <div className="space-y-1.5">
                {brands.map((b) => (
                  <label key={b} className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeBrand.toLowerCase() === b.toLowerCase()}
                      onChange={() => setActiveBrand(activeBrand.toLowerCase() === b.toLowerCase() ? '' : b)}
                      className="rounded border-border focus:ring-0 text-foreground"
                    />
                    <span>{b}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-2 border-b border-border pb-4 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Price Range</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-card border border-border px-3 py-1.5 rounded-lg text-xs"
                />
                <span className="text-xs text-muted-foreground">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-card border border-border px-3 py-1.5 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2 border-b border-border pb-4 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Minimum Rating</h4>
              <div className="space-y-1.5">
                {[5, 4, 3, 2].map((num) => (
                  <button
                    key={num}
                    onClick={() => setActiveRating(activeRating === num ? null : num)}
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${activeRating === num ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <div className="flex text-yellow-400">
                      {[...Array(num)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current stroke-none" />)}
                      {[...Array(5 - num)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-muted stroke-current" />)}
                    </div>
                    <span>&amp; Up</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-2 border-b border-border pb-4 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Colors</h4>
              <div className="flex flex-wrap gap-1.5">
                {colors.map((col) => (
                  <button
                    key={col}
                    onClick={() => setActiveColor(activeColor === col ? '' : col)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${activeColor === col ? 'bg-foreground text-background border-transparent' : 'bg-card border-border hover:bg-muted text-muted-foreground'}`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-2 border-b border-border pb-4 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sizes</h4>
              <div className="flex flex-wrap gap-1.5">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setActiveSize(activeSize === s ? '' : s)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-colors ${activeSize === s ? 'bg-foreground text-background border-transparent' : 'bg-card border-border hover:bg-muted text-muted-foreground'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products List Grid */}
          <div className="lg:col-span-3 space-y-8">
            
            {loading ? (
              // Loading skeletons
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="border border-border rounded-2xl overflow-hidden bg-card p-5 space-y-4">
                    <div className="aspect-square w-full rounded-xl skeleton" />
                    <div className="h-4 w-1/3 rounded skeleton" />
                    <div className="h-6 w-3/4 rounded skeleton" />
                    <div className="h-4 w-1/2 rounded skeleton" />
                    <div className="pt-2 flex gap-2">
                      <div className="h-9 flex-1 rounded-lg skeleton" />
                      <div className="h-9 w-9 rounded-lg skeleton" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              // Empty search
              <div className="h-80 border border-border border-dashed rounded-3xl flex flex-col justify-center items-center text-center space-y-3 px-6">
                <div className="text-2xl">🔍</div>
                <h3 className="font-bold text-lg">No products found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-0.5">
                  We couldn't find matches for your active filters. Try adjusting price bounds or expanding categories.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-foreground text-background text-xs font-semibold px-5 py-2.5 rounded-lg hover:bg-neutral-800"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              // Main grid
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {products.map((product) => {
                  const wishlist = isInWishlist(product.id);
                  return (
                    <div
                      key={product.id}
                      className="group relative border border-border rounded-2xl overflow-hidden bg-card hover:shadow-lg transition-all duration-300"
                    >
                      {/* Image container */}
                      <div className="relative aspect-square w-full bg-muted overflow-hidden">
                        <Link href={`/product/${product.slug}`}>
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </Link>

                        <button
                          onClick={() => toggleWishlist(product)}
                          className={`absolute top-4 right-4 p-2 rounded-full shadow-md transition-colors ${wishlist ? 'bg-red-500 text-white' : 'bg-background text-muted-foreground hover:text-foreground'}`}
                          aria-label="Add to wishlist"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </div>

                      {/* Info details */}
                      <div className="p-5 space-y-1">
                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                        <h3 className="font-semibold text-sm truncate">
                          <Link href={`/product/${product.slug}`} className="hover:underline">
                            {product.name}
                          </Link>
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center space-x-1 pt-1">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 stroke-none" />
                          <span className="text-xs font-semibold">{product.ratings.toFixed(1)}</span>
                        </div>

                        {/* Price */}
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

                        {/* Add to Cart Actions */}
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
                            title="View details"
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
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 border-t border-border pt-8">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-border rounded-lg bg-card text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-border rounded-lg bg-card text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div>Loading catalogue...</div>}>
      <ShopContent />
    </Suspense>
  );
}
