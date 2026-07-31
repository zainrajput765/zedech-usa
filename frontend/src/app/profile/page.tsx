'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import {
  User as UserIcon,
  MapPin,
  ShoppingBag,
  Heart,
  Edit2,
  Trash2,
  Plus,
  Compass,
  CheckCircle,
  Truck,
  PackageCheck,
  FileText
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, isAuthenticated, logout, updateProfile, refreshUser } = useAuth();
  const { wishlistItems, removeFromWishlist, moveWishlistToCart } = useCart();
  const { formatPrice } = useCurrency();

  // Active Tab
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Address Form / State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrType, setAddrType] = useState('shipping');
  const [addrName, setAddrName] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrZip, setAddrZip] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrDefault, setAddrDefault] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  // Load orders when Tab is Orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      setLoadingOrders(true);
      try {
        const res = await fetch(`${API_URL}/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.warn('API offline, orders listing simulation.');
      } finally {
        setLoadingOrders(false);
      }
    };

    if (activeTab === 'orders') fetchOrders();
  }, [activeTab, token]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    const res = await updateProfile({ name, email, password: password || undefined });
    if (res.success) {
      setProfileSuccess('Profile updated successfully.');
      setPassword('');
    } else {
      setProfileError(res.message || 'Profile update failed.');
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      // For simplicity, we directly update user address array in backend auth controller profile updates
      const updatedAddresses = [
        ...(user?.addresses || []),
        {
          id: `addr_${Math.random().toString(36).substring(2, 10)}`,
          type: addrType,
          name: addrName,
          street: addrStreet,
          city: addrCity,
          state: addrState,
          postalCode: addrZip,
          country: 'United States',
          phone: addrPhone,
          isDefault: addrDefault,
        }
      ];

      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ addresses: updatedAddresses }),
      });

      const data = await res.json();
      if (data.success) {
        await refreshUser();
        setShowAddressForm(false);
        // Clear fields
        setAddrName('');
        setAddrStreet('');
        setAddrCity('');
        setAddrState('');
        setAddrZip('');
        setAddrPhone('');
        setAddrDefault(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async (addrId: string) => {
    if (!token || !user?.addresses) return;
    try {
      const filtered = user.addresses.filter(a => a.id !== addrId);
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ addresses: filtered }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshUser();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        // Refresh orders
        setOrders(orders.map(o => o.id === orderId ? { ...o, orderStatus: 'CANCELLED' } : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReturnOrder = async (orderId: string) => {
    if (!token) return;
    if (!confirm('Would you like to request a return and refund for this delivered order?')) return;

    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/return`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setOrders(orders.map(o => o.id === orderId ? { ...o, orderStatus: 'RETURNED' } : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const downloadInvoice = (order: any) => {
    const text = `
=========================================
INVOICE - ZEDECH
Order ID: ${order.id}
Date: ${new Date(order.createdAt).toLocaleDateString()}
=========================================

Customer Details:
Name: ${order.shippingAddress.name}
Phone: ${order.shippingAddress.phone}
Address: ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}

Items Purchased:
${order.orderItems?.map((item: any) => `- ${item.name} (Qty: ${item.quantity}) - $${item.price.toFixed(2)}`).join('\n')}

Financial Summary:
Subtotal: $${order.itemsPrice.toFixed(2)}
Discount Applied: -$${order.discountPrice.toFixed(2)}
Shipping Cost: $${order.shippingPrice.toFixed(2)}
Sales Tax (8%): $${order.taxPrice.toFixed(2)}
=========================================
TOTAL CHARGED: $${order.totalPrice.toFixed(2)}
=========================================
Payment Provider: ${order.paymentMethod.toUpperCase()} (${order.paymentStatus})
Thank you for shopping with Zedech!
`;
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `zedech_invoice_${order.id.substring(0, 8)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const renderOrderStatusTracker = (status: string) => {
    const stages = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIdx = stages.indexOf(status);

    if (status === 'CANCELLED') {
      return (
        <div className="bg-red-500/10 text-red-600 border border-red-500/20 p-3 rounded-lg text-xs font-semibold">
          Order Cancelled. Funds have been returned to original card.
        </div>
      );
    }
    if (status === 'RETURNED') {
      return (
        <div className="bg-amber-500/10 text-amber-600 border border-amber-500/20 p-3 rounded-lg text-xs font-semibold">
          Return request submitted. Courier label dispatched.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
          <span className={currentIdx >= 0 ? 'text-foreground font-bold' : ''}>Ordered</span>
          <span className={currentIdx >= 1 ? 'text-foreground font-bold' : ''}>Packed</span>
          <span className={currentIdx >= 2 ? 'text-foreground font-bold' : ''}>Shipped</span>
          <span className={currentIdx >= 3 ? 'text-foreground font-bold' : ''}>Delivered</span>
        </div>

        {/* Bar */}
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden relative">
          <div
            className="absolute h-full bg-foreground rounded-full transition-all duration-500"
            style={{ width: `${(Math.max(0, currentIdx) / 3) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar panel */}
        <aside className="space-y-2 border-r border-border lg:pr-8">
          <div className="pb-6 border-b border-border mb-6">
            <h2 className="font-bold text-lg">{user?.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{user?.email}</p>
            
            {/* Loyalty points banner */}
            <div className="mt-4 bg-muted border border-border p-3.5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block">Loyalty Points</span>
              <span className="text-xl font-extrabold text-foreground block mt-1">⭐️ {user?.loyaltyPoints || 0} pts</span>
              <p className="text-[9px] text-muted-foreground mt-1">Earn 1 point for every $10 spent. Redeem points on upcoming drops.</p>
            </div>
          </div>

          <nav className="space-y-1 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-left transition-colors ${activeTab === 'profile' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
            >
              <UserIcon className="w-4 h-4" /> Personal Information
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-left transition-colors ${activeTab === 'addresses' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
            >
              <MapPin className="w-4 h-4" /> Manage Addresses
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-left transition-colors ${activeTab === 'orders' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
            >
              <ShoppingBag className="w-4 h-4" /> Order History
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-left transition-colors ${activeTab === 'wishlist' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
            >
              <Heart className="w-4 h-4" /> Wishlist ({wishlistItems.length})
            </button>
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-left text-red-600 hover:bg-red-500/10 font-bold transition-colors border-t border-border mt-4"
            >
              Log Out
            </button>
          </nav>
        </aside>

        {/* Tab contents */}
        <section className="lg:col-span-3">
          
          {/* Tab 1: Profile Editing */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Personal Information</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Update your account name, email address, or credentials.</p>
              </div>

              <form onSubmit={handleProfileUpdate} className="p-6 border border-border rounded-2xl bg-card space-y-4 max-w-xl shadow-sm">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Change Password (Optional)</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                {profileSuccess && <p className="text-xs text-green-600 font-semibold">{profileSuccess}</p>}
                {profileError && <p className="text-xs text-red-500 font-semibold">{profileError}</p>}

                <button
                  type="submit"
                  className="bg-foreground text-background text-xs font-bold px-6 py-2.5 rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* Tab 2: Address Manager */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold tracking-tight">Manage Addresses</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 font-light">Set default destination parameters for shipping.</p>
                </div>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="inline-flex items-center gap-1 bg-foreground text-background text-xs font-bold px-4 py-2 rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Address
                </button>
              </div>

              {/* Form overlay */}
              {showAddressForm && (
                <form onSubmit={handleCreateAddress} className="p-6 border border-border border-dashed rounded-2xl bg-card space-y-4 max-w-xl shadow-sm">
                  <h4 className="font-bold text-sm">New Address</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Address Label</label>
                      <select value={addrType} onChange={(e) => setAddrType(e.target.value)} className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs">
                        <option value="shipping">Shipping Address</option>
                        <option value="billing">Billing Address</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Receiver Name</label>
                      <input type="text" value={addrName} onChange={(e) => setAddrName(e.target.value)} className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs" required />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Street Address</label>
                      <input type="text" value={addrStreet} onChange={(e) => setAddrStreet(e.target.value)} className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">City</label>
                      <input type="text" value={addrCity} onChange={(e) => setAddrCity(e.target.value)} className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">State</label>
                      <input type="text" value={addrState} onChange={(e) => setAddrState(e.target.value)} className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">ZIP / Postal Code</label>
                      <input type="text" value={addrZip} onChange={(e) => setAddrZip(e.target.value)} className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Phone</label>
                      <input type="text" value={addrPhone} onChange={(e) => setAddrPhone(e.target.value)} className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs" required />
                    </div>
                    <div className="space-y-1 sm:col-span-2 flex items-center gap-2">
                      <input type="checkbox" checked={addrDefault} onChange={() => setAddrDefault(!addrDefault)} id="defCheck" className="rounded" />
                      <label htmlFor="defCheck" className="text-xs font-semibold text-muted-foreground cursor-pointer">Set as default address</label>
                    </div>
                  </div>
                  <div className="flex gap-2.5 pt-2">
                    <button type="submit" className="bg-foreground text-background text-xs font-bold px-5 py-2 rounded-lg">Save</button>
                    <button type="button" onClick={() => setShowAddressForm(false)} className="bg-muted hover:bg-border text-foreground text-xs font-semibold px-5 py-2 rounded-lg">Cancel</button>
                  </div>
                </form>
              )}

              {/* Addresses List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {!user?.addresses || user.addresses.length === 0 ? (
                  <p className="text-sm text-muted-foreground lg:col-span-2">No addresses added yet.</p>
                ) : (
                  user.addresses.map((a: any) => (
                    <div key={a.id} className="p-5 border border-border rounded-2xl bg-card space-y-4 shadow-sm relative">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                          {a.type}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteAddress(a.id)}
                            className="p-1 rounded text-red-500 hover:bg-red-500/10"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="text-xs font-semibold space-y-1">
                        <p className="text-sm font-bold text-foreground">{a.name}</p>
                        <p className="text-muted-foreground">{a.street}</p>
                        <p className="text-muted-foreground">{a.city}, {a.state} {a.postalCode}</p>
                        <p className="text-muted-foreground">📞 {a.phone}</p>
                      </div>

                      {a.isDefault && (
                        <span className="text-[9px] uppercase font-extrabold text-foreground border border-foreground px-2 py-0.5 rounded-full block text-center max-w-[80px]">
                          Default
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Order History */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Order History</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Track shipping statuses, print invoices, or manage returns.</p>
              </div>

              {loadingOrders ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => <div key={i} className="h-44 w-full rounded-2xl skeleton" />)}
                </div>
              ) : orders.length === 0 ? (
                <p className="text-sm text-muted-foreground">You haven't placed any orders yet.</p>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-border rounded-3xl overflow-hidden bg-card shadow-sm">
                      {/* Order Header info */}
                      <div className="p-5 border-b border-border bg-muted/20 flex flex-wrap justify-between items-center gap-4 text-xs font-semibold text-muted-foreground">
                        <div>
                          <p>ORDER ID</p>
                          <p className="font-bold text-foreground font-mono mt-0.5">{order.id.substring(0, 8)}</p>
                        </div>
                        <div>
                          <p>DATE PLACED</p>
                          <p className="font-bold text-foreground mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p>TOTAL AMOUNT</p>
                          <p className="font-bold text-foreground mt-0.5">{formatPrice(order.totalPrice)}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => downloadInvoice(order)}
                            className="flex items-center gap-1.5 bg-background border border-border px-3.5 py-1.5 rounded-lg hover:text-foreground shadow-sm"
                          >
                            <FileText className="w-3.5 h-3.5" /> Invoice
                          </button>
                        </div>
                      </div>

                      {/* Items List & Status tracking */}
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        {/* Items list */}
                        <div className="space-y-3.5">
                          {order.orderItems?.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-3.5">
                              <img src={item.image} alt="" className="w-12 h-12 object-cover bg-muted rounded-lg border border-border" />
                              <div className="min-w-0">
                                <h5 className="font-bold text-xs truncate">{item.name}</h5>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  Size: {item.size || 'One Size'} / Color: {item.color || 'Default'} &times; {item.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Tracker & Control buttons */}
                        <div className="space-y-5">
                          {renderOrderStatusTracker(order.orderStatus)}

                          {/* Cancellation/Return buttons */}
                          <div className="flex gap-2">
                            {(order.orderStatus === 'PENDING' || order.orderStatus === 'PROCESSING') && (
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-600 text-[10px] font-bold px-4 py-2 rounded-lg transition-colors"
                              >
                                Cancel Order
                              </button>
                            )}
                            {order.orderStatus === 'DELIVERED' && (
                              <button
                                onClick={() => handleReturnOrder(order.id)}
                                className="bg-foreground text-background text-[10px] font-bold px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
                              >
                                Request Return
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Wishlist board */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Your Wishlist</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Your catalog favorites queued to purchase.</p>
              </div>

              {wishlistItems.length === 0 ? (
                <div className="h-60 border border-border border-dashed rounded-3xl flex flex-col justify-center items-center text-center text-muted-foreground text-sm">
                  Your wishlist is empty. Discover items to populate it.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {wishlistItems.map((item) => (
                    <div key={item.productId} className="border border-border rounded-2xl overflow-hidden bg-card hover:shadow-md transition-shadow">
                      <Link href={`/product/${item.slug}`} className="block aspect-square w-full bg-muted overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </Link>
                      <div className="p-4 space-y-1">
                        <h4 className="font-semibold text-xs truncate">
                          <Link href={`/product/${item.slug}`} className="hover:underline">{item.name}</Link>
                        </h4>
                        <p className="text-xs font-bold text-foreground">{formatPrice(item.price)}</p>
                        
                        <div className="pt-3 flex gap-2">
                          <button
                            onClick={() => moveWishlistToCart(item)}
                            className="flex-1 bg-foreground text-background text-[10px] font-semibold py-2 rounded-lg hover:bg-neutral-800 transition-all"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={() => removeFromWishlist(item.productId)}
                            className="bg-muted hover:bg-border text-red-500 p-2 rounded-lg transition-colors flex items-center justify-center"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </section>

      </main>
      <Footer />
    </>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
