'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const { resetPassword } = useAuth();
  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setEmail(searchParams.get('email') || '');
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code || !newPassword) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await resetPassword(email, code, newPassword);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } else {
      setErrorMsg(res.message || 'Invalid or expired recovery code.');
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto px-6 py-20 flex-1 flex flex-col justify-center space-y-6">
        
        <div className="text-center space-y-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight">Reset Password</h1>
          <p className="text-xs text-muted-foreground">Type in your recovery code and choose a secure new password.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 border border-border rounded-2xl bg-card space-y-4 shadow-sm">
          
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
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Recovery Code</label>
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

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">New Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs focus:outline-none"
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
          </button>

        </form>

      </main>
      <Footer />
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading reset page...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
