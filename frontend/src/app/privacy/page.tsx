'use client';

import React from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 space-y-8">
        <div className="space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-muted-foreground">Legal</span>
          <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground">Last updated: July 31, 2026</p>
        </div>

        <article className="prose prose-sm text-muted-foreground space-y-6 font-light leading-relaxed">
          <p>
            At Zedech, we value the trust you place in us. This Privacy Policy describes how we collect, use, disclose, and safeguard your personal information when you visit or make a purchase from our eCommerce portal.
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground tracking-tight">1. Information We Collect</h2>
            <p>
              When you use our store, we collect details necessary to complete transactions and authenticate your profile, including:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-xs">
              <li><strong>Contact details:</strong> Your name, email address, physical shipping/billing address, and phone number.</li>
              <li><strong>Credentials:</strong> Account usernames and hashed passwords for profile sign-ins.</li>
              <li><strong>Payment details:</strong> Credit card identifiers processed securely via Stripe or PayPal (we do not store raw card numbers on our servers).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground tracking-tight">2. How We Use Your Information</h2>
            <p>
              Your information helps us process orders, issue discount coupons, verify email accounts, manage order history trackers, and personalize your overall catalog suggestions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground tracking-tight">3. Data Protection & Safety</h2>
            <p>
              We implement industry-standard 256-bit SSL encryption across our entire application routing to ensure transit data is secure. Hashed passwords utilize robust bcrypt libraries to guard against credentials theft.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground tracking-tight">4. Third-Party Sharing</h2>
            <p>
              We share your data only with third-party service providers required for transactions (e.g., Stripe for processing payments, and mail servers for dispatching purchase invoices and verification tokens). We never sell your personal information to marketing advertisers.
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
