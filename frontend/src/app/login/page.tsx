'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import { Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, googleLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push('/profile');
    } else {
      setErrorMsg(res.message || 'Invalid email or password.');
    }
  };

  const handleGoogleMockLogin = async () => {
    setGoogleLoading(true);
    setErrorMsg('');

    // Simulate Google account selection
    setTimeout(async () => {
      const res = await googleLogin(
        'jane.doe@gmail.com',
        'Jane Doe',
        'google_oauth_987654321'
      );
      setGoogleLoading(false);

      if (res.success) {
        router.push('/profile');
      } else {
        setErrorMsg('Google authentication failed.');
      }
    }, 1200);
  };

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto px-6 py-20 flex-1 flex flex-col justify-center space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome Back</h1>
          <p className="text-xs text-muted-foreground">Sign in to your Zedech account to resume your shopping.</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="p-6 border border-border rounded-2xl bg-card space-y-4 shadow-sm">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              required
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Password</label>
              <Link href="/forgot-password" className="text-[10px] text-muted-foreground hover:text-foreground font-semibold underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              required
            />
          </div>

          {errorMsg && <p className="text-xs text-red-500 font-semibold">{errorMsg}</p>}

          {/* Email Login CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-foreground text-background font-bold py-3 rounded-xl hover:bg-neutral-800 disabled:opacity-50 transition-all text-xs"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
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
            onClick={handleGoogleMockLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2 bg-muted hover:bg-border text-foreground font-semibold py-3 rounded-xl transition-all text-xs"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Registration link */}
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="text-foreground font-bold hover:underline">
                Register
              </Link>
            </p>
          </div>

        </form>

      </main>
      <Footer />
    </>
  );
}
