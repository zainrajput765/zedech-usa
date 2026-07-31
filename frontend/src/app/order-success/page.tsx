'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { CheckCircle2, ArrowRight, ShoppingBag } from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId') || 'unknown';

  // Estimate delivery (e.g. 4 days from now)
  const estDate = new Date();
  estDate.setDate(estDate.getDate() + 4);
  const formattedEstDate = estDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <Header />
      <main className="max-w-xl mx-auto px-6 py-20 flex-1 flex flex-col justify-center items-center text-center space-y-6">
        
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
          <CheckCircle2 className="w-10 h-10 stroke-[1.5]" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Order Confirmed!</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Thank you for shopping with Zedech. Your transaction was processed successfully.
          </p>
        </div>

        {/* Order Details Panel */}
        <div className="w-full p-6 border border-border rounded-2xl bg-card text-left space-y-4 shadow-sm">
          <div className="flex justify-between items-center text-xs border-b border-border pb-3">
            <span className="text-muted-foreground font-semibold">Order ID</span>
            <span className="font-bold text-foreground font-mono truncate max-w-[200px]">{orderId}</span>
          </div>
          
          <div className="flex justify-between items-start text-xs border-b border-border pb-3">
            <div>
              <p className="text-muted-foreground font-semibold">Estimated Delivery</p>
              <p className="font-bold text-foreground mt-0.5">{formattedEstDate}</p>
            </div>
            <span className="text-[10px] uppercase font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-md">
              Processing
            </span>
          </div>

          <div className="text-[10px] text-muted-foreground leading-relaxed">
            A confirmation receipt and order shipping updates have been sent to your email address.
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3.5 w-full pt-4">
          <button
            onClick={() => router.push('/profile?tab=orders')}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-foreground text-background font-bold py-3 rounded-xl hover:bg-neutral-800 transition-all text-xs"
          >
            <ShoppingBag className="w-4 h-4" /> View Order History
          </button>
          <button
            onClick={() => router.push('/shop')}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-muted hover:bg-border text-foreground font-bold py-3 rounded-xl transition-all text-xs"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </main>
      <Footer />
    </>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div>Loading receipt...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
