'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import { Loader2, X } from 'lucide-react';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { signup, googleLogin } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await signup(name, email, password);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message || 'Registration successful! Redirecting to email verification...');
      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(redirect)}`);
      }, 1500);
    } else {
      setErrorMsg(res.message || 'Failed to register account.');
    }
  };

  const handleGoogleLoginSubmit = async (gmail: string, gname: string, gid: string) => {
    setGoogleLoading(true);
    setErrorMsg('');

    setTimeout(async () => {
      const res = await googleLogin(gmail, gname, gid);
      setGoogleLoading(false);

      if (res.success) {
        setShowGoogleModal(false);
        router.push(redirect);
      } else {
        setErrorMsg('Google authentication failed.');
        setShowGoogleModal(false);
      }
    }, 1000);
  };

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto px-6 py-20 flex-1 flex flex-col justify-center space-y-6">
        
        <div className="text-center space-y-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight">Create Account</h1>
          <p className="text-xs text-muted-foreground">Register below to begin your luxury shopping experience.</p>
        </div>

        <form onSubmit={handleSignupSubmit} className="p-6 border border-border rounded-2xl bg-card space-y-4 shadow-sm">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Full Name</label>
            <input
              type="text"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs focus:outline-none"
              required
            />
          </div>

          {errorMsg && <p className="text-xs text-red-500 font-semibold">{errorMsg}</p>}
          {successMsg && <p className="text-xs text-green-600 font-semibold">{successMsg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-foreground text-background font-bold py-3 rounded-xl hover:bg-neutral-800 disabled:opacity-50 transition-all text-xs cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register'}
          </button>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-border" />
            <span className="px-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">or</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Google Mock Login CTA */}
          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            className="w-full flex items-center justify-center gap-2 bg-muted hover:bg-border text-foreground font-semibold py-3 rounded-xl transition-all text-xs cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-foreground font-bold hover:underline">
                Log In
              </Link>
            </p>
          </div>

        </form>

      </main>

      {/* Google Modal Overlay */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-6 relative animate-in fade-in zoom-in duration-200">
            
            {/* Close button */}
            <button 
              onClick={() => {
                setShowGoogleModal(false);
                setCustomEmail('');
                setCustomName('');
                setShowCustomInput(false);
              }}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Logo and Header */}
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">Sign in with Google</h2>
              <p className="text-xs text-muted-foreground">Choose an account to continue to Zedech</p>
            </div>

            {/* Modal loading */}
            {googleLoading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-xs font-semibold text-muted-foreground">Connecting securely...</p>
              </div>
            ) : (
              <div className="space-y-3">
                
                {/* Account Option: Customer */}
                <button
                  type="button"
                  onClick={() => handleGoogleLoginSubmit('customer@zedech.com', 'Zedech Customer', 'google_cust_123')}
                  className="w-full text-left px-4 py-3 rounded-2xl border border-border hover:bg-muted flex items-center gap-3 transition-colors text-xs font-semibold cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                    ZC
                  </div>
                  <div className="min-w-0">
                    <p className="text-foreground truncate font-bold">Zedech Customer</p>
                    <p className="text-[10px] text-muted-foreground truncate">customer@zedech.com</p>
                  </div>
                </button>

                {/* Account Option: Admin */}
                <button
                  type="button"
                  onClick={() => handleGoogleLoginSubmit('admin@zedech.com', 'Zedech Admin', 'google_adm_123')}
                  className="w-full text-left px-4 py-3 rounded-2xl border border-border hover:bg-muted flex items-center gap-3 transition-colors text-xs font-semibold cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold shrink-0">
                    ZA
                  </div>
                  <div className="min-w-0">
                    <p className="text-foreground truncate font-bold">Zedech Admin</p>
                    <p className="text-[10px] text-muted-foreground truncate">admin@zedech.com</p>
                  </div>
                </button>

                {/* Custom Account Toggle */}
                {!showCustomInput ? (
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(true)}
                    className="w-full text-center py-2.5 rounded-2xl border border-dashed border-border hover:bg-muted text-[11px] font-bold text-muted-foreground transition-all cursor-pointer"
                  >
                    + Use another account
                  </button>
                ) : (
                  <div className="p-3 bg-muted/30 border border-border rounded-2xl space-y-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase block">Name</label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-background border border-border px-3 py-1.5 rounded-lg text-xs focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase block">Email Address</label>
                      <input
                        type="email"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        placeholder="john.doe@gmail.com"
                        className="w-full bg-background border border-border px-3 py-1.5 rounded-lg text-xs focus:outline-none"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (customEmail && customName) {
                          handleGoogleLoginSubmit(customEmail, customName, `google_cust_${Date.now()}`);
                        }
                      }}
                      className="w-full bg-foreground text-background text-xs font-bold py-2 rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}
