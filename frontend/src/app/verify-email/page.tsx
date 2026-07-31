'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const { verifyEmail } = useAuth();
  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setEmail(searchParams.get('email') || '');
  }, [searchParams]);

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await verifyEmail(email, code);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Email verified successfully! Loading profile...');
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } else {
      setErrorMsg(res.message || 'Invalid verification code.');
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto px-6 py-20 flex-1 flex flex-col justify-center space-y-6">
        
        <div className="text-center space-y-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight">Verify Email</h1>
          <p className="text-xs text-muted-foreground">Please enter the 6-digit verification code sent to your email.</p>
        </div>

        <form onSubmit={handleVerifySubmit} className="p-6 border border-border rounded-2xl bg-card space-y-4 shadow-sm">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs focus:outline-none"
              required
              disabled={!!emailParam}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">6-Digit Code</label>
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs text-center font-bold tracking-widest focus:outline-none"
              required
            />
          </div>

          {errorMsg && <p className="text-xs text-red-500 font-semibold">{errorMsg}</p>}
          {successMsg && <p className="text-xs text-green-600 font-semibold">{successMsg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-foreground text-background font-bold py-3 rounded-xl hover:bg-neutral-800 disabled:opacity-50 transition-all text-xs"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Code'}
          </button>

        </form>

      </main>
      <Footer />
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading verify page...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
