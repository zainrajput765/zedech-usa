'use client';

import React, { useEffect, useState, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import { useCurrency } from '../../../context/CurrencyContext';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { Star, ShieldAlert, Award, ChevronRight, Plus, Minus, ThumbsUp, Camera } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const MOCK_COMPLEMENTARY = [
  { id: '2', name: 'AeroShield Windbreaker', slug: 'aeroshield-windbreaker', brand: 'Nike', price: 95.00, images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&auto=format&fit=crop&q=80'] }
];

const MOCK_PRODUCT = {
  id: '1',
  name: 'Apex Pro Runner',
  slug: 'apex-pro-runner',
  brand: 'Nike',
  sku: 'NIK-APX-PR-001',
  description: 'Engineered for speed, durability, and comfort. Features a carbon fiber plate and responsive foam cushioning for unmatched energy return.',
  price: 180.00,
  originalPrice: 220.00,
  countInStock: 5,
  images: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop&q=80'
  ],
  colors: ['Neon Red', 'Stealth Black', 'Volt Green'],
  sizes: ['US 8', 'US 9', 'US 10', 'US 11'],
  ratings: 4.5,
  numReviews: 2,
  reviews: [
    {
      id: 'r1',
      rating: 5,
      title: 'Amazing comfort!',
      comment: 'Absolutely love these. Fits perfectly and provides great energy return during my runs.',
      helpful: 12,
      createdAt: '2026-07-28T12:00:00.000Z',
      user: { name: 'Sarah Miller' }
    },
    {
      id: 'r2',
      rating: 4,
      title: 'Great but snug',
      comment: 'Very responsive. Snug fit, so I would suggest ordering a half size up.',
      helpful: 4,
      createdAt: '2026-07-25T14:30:00.000Z',
      user: { name: 'John Doe' }
    }
  ]
};

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const { token, isAuthenticated } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [frequentlyBought, setFrequentlyBought] = useState<any[]>(MOCK_COMPLEMENTARY);
  const [activeImage, setActiveImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  // Review states
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/products/${slug}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.product);
          setFrequentlyBought(data.frequentlyBoughtTogether || []);
          setActiveImage(data.product.images[0]);
          setSelectedColor(data.product.colors[0] || 'Default');
          setSelectedSize(data.product.sizes[0] || 'One Size');
        } else {
          setProduct(MOCK_PRODUCT);
          setActiveImage(MOCK_PRODUCT.images[0]);
          setSelectedColor(MOCK_PRODUCT.colors[0]);
          setSelectedSize(MOCK_PRODUCT.sizes[0]);
        }
      } catch (err) {
        console.warn('API details offline, loading simulated product mock.');
        // Match mock by slug
        setProduct(MOCK_PRODUCT);
        setActiveImage(MOCK_PRODUCT.images[0]);
        setSelectedColor(MOCK_PRODUCT.colors[0]);
        setSelectedSize(MOCK_PRODUCT.sizes[0]);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProduct();
  }, [slug]);

  const handleAddBundle = () => {
    if (!product) return;
    // Add primary item
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      color: selectedColor,
      size: selectedSize,
      image: product.images[0],
      slug: product.slug,
      countInStock: product.countInStock,
    }, 1);

    // Add frequently bought bundle items
    frequentlyBought.forEach((item) => {
      addToCart({
        productId: item.id,
        name: item.name,
        price: item.price,
        color: 'Default',
        size: 'One Size',
        image: item.images[0],
        slug: item.slug,
        countInStock: 10,
      }, 1);
    });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setReviewError('');
    setReviewSuccess('');

    try {
      const res = await fetch(`${API_URL}/products/${product.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: newRating,
          title: newTitle,
          comment: newComment,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReviewSuccess('Review posted successfully. Reloading reviews...');
        setNewTitle('');
        setNewComment('');
        // Refresh product info
        const updatedRes = await fetch(`${API_URL}/products/${slug}`);
        const updatedData = await updatedRes.json();
        if (updatedData.success) {
          setProduct(updatedData.product);
        }
      } else {
        setReviewError(data.message || 'Failed to submit review.');
      }
    } catch (err) {
      setReviewError('Failed to submit review. Connection error.');
    }
  };

  const handleHelpfulClick = async (reviewId: string) => {
    try {
      const res = await fetch(`${API_URL}/products/reviews/${reviewId}/helpful`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setProduct((prev: any) => ({
          ...prev,
          reviews: prev.reviews.map((r: any) =>
            r.id === reviewId ? { ...r, helpful: data.helpful } : r
          ),
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="h-10 w-48 rounded skeleton mx-auto mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="aspect-square rounded-2xl skeleton" />
            <div className="space-y-6">
              <div className="h-6 w-1/3 rounded skeleton" />
              <div className="h-12 w-3/4 rounded skeleton" />
              <div className="h-6 w-1/2 rounded skeleton" />
              <div className="h-24 w-full rounded skeleton" />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-32 text-center space-y-4">
          <h2 className="text-xl font-bold">Product not found</h2>
          <button onClick={() => router.push('/shop')} className="bg-foreground text-background text-xs font-semibold px-6 py-2.5 rounded-lg">
            Back to Shop
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10 flex-1 space-y-16">
        
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-xs text-muted-foreground font-semibold">
          <Link href="/shop" className="hover:text-foreground">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground">{product.name}</span>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-3xl overflow-hidden shadow-sm border border-border zoom-container">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover zoom-image"
              />
            </div>
            
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 rounded-xl overflow-hidden bg-muted border ${activeImage === img ? 'border-primary ring-2 ring-primary/10' : 'border-border'} transition-all`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Configuration Panel */}
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground">{product.brand}</span>
              <h1 className="text-3xl font-extrabold tracking-tight">{product.name}</h1>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 fill-current ${i < Math.round(product.ratings) ? 'text-yellow-400' : 'text-muted stroke-current'}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-muted-foreground">
                  {product.ratings.toFixed(1)} ({product.numReviews} Reviews)
                </span>
              </div>
            </div>

            {/* Price display */}
            <div className="flex items-baseline space-x-3 border-b border-border pb-6">
              <span className="text-2xl font-bold text-foreground">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-base text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2 text-sm leading-relaxed text-muted-foreground font-light">
              <p>{product.description}</p>
            </div>

            {/* Variant selections */}
            {product.colors.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Color: {selectedColor}</h4>
                <div className="flex gap-2">
                  {product.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`text-xs px-3.5 py-1.5 rounded-lg border font-medium transition-all ${selectedColor === color ? 'bg-foreground text-background border-transparent' : 'bg-background border-border text-muted-foreground hover:text-foreground'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Size: {selectedSize}</h4>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`text-xs px-3.5 py-2 rounded-lg border font-semibold min-w-[50px] transition-all ${selectedSize === size ? 'bg-foreground text-background border-transparent' : 'bg-background border-border text-muted-foreground hover:text-foreground'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock status & quantity controller */}
            <div className="flex items-center gap-6 pt-2">
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Stock Status</h4>
                {product.countInStock > 0 ? (
                  <span className="text-xs font-semibold text-green-600 bg-green-500/10 px-2.5 py-1 rounded-full inline-block">
                    In Stock (Only {product.countInStock} left)
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-red-600 bg-red-500/10 px-2.5 py-1 rounded-full inline-block">
                    Out of Stock
                  </span>
                )}
              </div>

              {product.countInStock > 0 && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quantity</h4>
                  <div className="flex items-center border border-border rounded-lg bg-card max-w-[120px]">
                    <button
                      onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                      disabled={qty <= 1}
                      className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-35"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="flex-1 text-center text-sm font-bold">{qty}</span>
                    <button
                      onClick={() => setQty((prev) => Math.min(product.countInStock, prev + 1))}
                      disabled={qty >= product.countInStock}
                      className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-35"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* CTA add button */}
            <div className="pt-4 flex gap-4">
              <button
                onClick={() => addToCart({
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  color: selectedColor,
                  size: selectedSize,
                  image: product.images[0],
                  slug: product.slug,
                  countInStock: product.countInStock,
                }, qty)}
                disabled={product.countInStock === 0}
                className="flex-1 bg-foreground text-background font-bold py-3.5 rounded-xl hover:bg-neutral-800 disabled:opacity-40 shadow-lg shadow-black/5 transition-all text-sm"
              >
                Add {qty} Item{qty > 1 ? 's' : ''} to Cart
              </button>
            </div>

            <div className="border-t border-border pt-6 flex flex-col gap-2.5 text-xs text-muted-foreground font-semibold">
              <p>SKU: <span className="text-foreground">{product.sku}</span></p>
              <p>Brand: <span className="text-foreground">{product.brand}</span></p>
              <p>Complimentary 3-5 business day delivery.</p>
            </div>
          </div>
        </div>

        {/* Frequently Bought Together (Upsell bundle) */}
        {frequentlyBought.length > 0 && (
          <section className="p-8 border border-border rounded-3xl bg-muted/20 space-y-6">
            <div>
              <h3 className="text-lg font-bold">Frequently Bought Together</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Combine and elevate your wardrobe with this bundled recommendation.</p>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
              <div className="flex items-center gap-4 flex-wrap">
                {/* Main Product */}
                <div className="flex items-center gap-3">
                  <img src={product.images[0]} alt="" className="w-16 h-16 object-cover rounded-xl bg-muted border border-border" />
                  <div>
                    <h5 className="font-semibold text-xs">{product.name}</h5>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{formatPrice(product.price)}</p>
                  </div>
                </div>

                <span className="text-lg font-light text-muted-foreground">+</span>

                {/* Bundle Item */}
                {frequentlyBought.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={item.images[0]} alt="" className="w-16 h-16 object-cover rounded-xl bg-muted border border-border" />
                    <div>
                      <h5 className="font-semibold text-xs">{item.name}</h5>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bundle Checkout Box */}
              <div className="border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-8 text-center md:text-left flex flex-col md:flex-row items-center gap-6 flex-shrink-0">
                <div>
                  <p className="text-xs text-muted-foreground">Total Bundle Price</p>
                  <p className="text-lg font-bold text-foreground mt-0.5">
                    {formatPrice(product.price + frequentlyBought.reduce((acc, x) => acc + x.price, 0))}
                  </p>
                </div>
                <button
                  onClick={handleAddBundle}
                  className="bg-foreground text-background text-xs font-semibold px-6 py-3 rounded-lg hover:bg-neutral-800 transition-colors shadow-sm"
                >
                  Add Bundle to Cart
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-border pt-16">
          
          {/* Review breakdown / Add Form */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold tracking-tight">Customer Reviews</h3>
            
            {/* Form */}
            <form onSubmit={handleReviewSubmit} className="p-6 border border-border rounded-2xl bg-card space-y-4 shadow-sm">
              <h4 className="font-semibold text-sm">Post a Review</h4>
              
              {/* Rating */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Rating Score</label>
                <div className="flex gap-1.5 text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-0.5 focus:outline-none"
                    >
                      <Star className={`w-6 h-6 ${newRating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-muted stroke-current'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Review Title</label>
                <input
                  type="text"
                  placeholder="Summarize your review"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  required
                />
              </div>

              {/* Comment */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Comments</label>
                <textarea
                  placeholder="How was the size, material, or color representation?"
                  rows={4}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-background border border-border px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  required
                />
              </div>

              {reviewSuccess && <p className="text-xs text-green-600 font-semibold">{reviewSuccess}</p>}
              {reviewError && <p className="text-xs text-red-500 font-semibold">{reviewError}</p>}

              <button
                type="submit"
                className="w-full bg-foreground text-background text-xs font-bold py-3 rounded-xl hover:bg-neutral-800 transition-colors"
              >
                {isAuthenticated ? 'Submit Review' : 'Log In to Review'}
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-6">
            {product.reviews.length === 0 ? (
              <div className="p-8 border border-border border-dashed rounded-3xl text-center text-muted-foreground text-sm">
                No reviews yet. Be the first to express your thoughts!
              </div>
            ) : (
              <div className="space-y-4">
                {product.reviews.map((r: any) => (
                  <div key={r.id} className="p-6 border border-border rounded-2xl bg-card space-y-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm">{r.title || 'Reviewer'}</h4>
                        <div className="flex text-yellow-400 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 fill-current ${i < r.rating ? 'text-yellow-400' : 'text-muted stroke-current'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground font-light leading-relaxed">
                      {r.comment}
                    </p>

                    <div className="flex justify-between items-center text-xs pt-2">
                      <span className="font-medium text-muted-foreground">
                        By {r.user?.name || 'Jane Customer'}
                      </span>
                      <button
                        onClick={() => handleHelpfulClick(r.id)}
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-semibold transition-colors"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" /> Helpful ({r.helpful})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
