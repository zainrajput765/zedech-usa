'use client';

import React from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 space-y-8">
        <div className="space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-muted-foreground">Legal</span>
          <h1 className="text-4xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="text-xs text-muted-foreground">Last updated: July 31, 2026</p>
        </div>

        <article className="prose prose-sm text-muted-foreground space-y-6 font-light leading-relaxed">
          <p>
            Welcome to Zedech. By accessing our platform, registering an account, or purchasing catalog goods, you agree to comply with and be bound by the following Terms of Service.
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground tracking-tight">1. Account Obligations</h2>
            <p>
              When registering a profile on our site, you must provide accurate, complete, and current information. You are solely responsible for protecting your account credentials and password. Unauthorized access must be reported to our support hotline immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground tracking-tight">2. Billing & Purchase Policies</h2>
            <p>
              By completing checkout, you agree to provide valid payment details. We reserve the right to cancel orders due to stock depletion, pricing discrepancies, or suspicious activity flagged by our fraud prevention filters. Prices are subject to change without notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground tracking-tight">3. User Conduct</h2>
            <p>
              Users are prohibited from using this platform to post malicious comments, manipulate review ratings, abuse coupon discount codes, or perform DDOS actions against our server infrastructure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground tracking-tight">4. Limitations of Liability</h2>
            <p>
              Zedech and its affiliates shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our platform or purchase goods.
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
