'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import { Loader2, X } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { login, googleLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleLoginSubmit = async (gmail: string, gname: string, gid: string) => {
    setGoogleLoading(true);
    setErrorMsg('');

    const res = await googleLogin(gmail, gname, gid);
    setGoogleLoading(false);

    if (res.success) {
      router.push(redirect);
    } else {
      setErrorMsg('Google authentication failed.');
    }
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const initializeGoogleSignIn = () => {
        if ((window as any).google?.accounts?.id) {
          (window as any).google.accounts.id.initialize({
            client_id: '788485292305-jmqc6n33i369u88bce95l2hbfu1q1cbb.apps.googleusercontent.com',
            callback: (response: any) => {
              try {
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
                );
                const payload = JSON.parse(jsonPayload);
                if (payload.email) {
                  handleGoogleLoginSubmit(payload.email, payload.name || 'Google User', payload.sub);
                }
              } catch (err) {
                console.error('Error decoding Google credential', err);
              }
            }
          });

          const btnElem = document.getElementById('google-signin-button');
          if (btnElem) {
            (window as any).google.accounts.id.renderButton(btnElem, {
              theme: 'outline',
              size: 'large',
              width: 320,
              text: 'continue_with'
            });
          }
        }
      };

      const checkInterval = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          initializeGoogleSignIn();
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push(redirect);
    } else {
      setErrorMsg(res.message || 'Invalid email or password.');
    }
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
            className="w-full flex items-center justify-center gap-2 bg-foreground text-background font-bold py-3 rounded-xl hover:bg-neutral-800 disabled:opacity-50 transition-all text-xs cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
          </button>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-border" />
            <span className="px-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">or</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Real Google Sign-In Button */}
          <div className="flex justify-center w-full pt-2">
            <div id="google-signin-button" className="w-full flex justify-center"></div>
          </div>

          {/* Registration link */}
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              Don't have an account?{' '}
              <Link href={`/signup?redirect=${encodeURIComponent(redirect)}`} className="text-foreground font-bold hover:underline">
                Register
              </Link>
            </p>
          </div>

        </form>

      </main>

      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      <Footer />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
