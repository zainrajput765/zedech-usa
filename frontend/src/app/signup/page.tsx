'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Script from 'next/script';
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
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '788485292305-jmqc6n33i369u88bce95l2hbfu1q1cbb.apps.googleusercontent.com',
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

          {/* Real Google Sign-In Button */}
          <div className="flex justify-center w-full pt-2">
            <div id="google-signin-button" className="w-full flex justify-center"></div>
          </div>

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

      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
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
