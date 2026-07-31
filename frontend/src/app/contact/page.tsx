'use client';

import React, { useState } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        
        {/* Contact details */}
        <section className="space-y-8 md:pr-8">
          <div className="space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-widest text-muted-foreground">Inquiries</span>
            <h1 className="text-4xl font-extrabold tracking-tight">Connect with Us</h1>
            <p className="text-muted-foreground text-sm font-light leading-relaxed">
              We look forward to hearing from you. Whether you have questions regarding customized orders, business partnerships, or product drops, we are ready to assist.
            </p>
          </div>

          <div className="space-y-5 text-sm font-semibold">
            <div className="flex items-center gap-3.5 text-muted-foreground">
              <div className="p-2.5 bg-muted rounded-xl text-foreground">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Email Support</p>
                <a href="mailto:support@zedech.com" className="text-foreground hover:underline mt-0.5 block">support@zedech.com</a>
              </div>
            </div>

            <div className="flex items-center gap-3.5 text-muted-foreground">
              <div className="p-2.5 bg-muted rounded-xl text-foreground">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Direct Hotline</p>
                <a href="tel:+18005550199" className="text-foreground hover:underline mt-0.5 block">+1 (800) 555-0199</a>
              </div>
            </div>

            <div className="flex items-center gap-3.5 text-muted-foreground">
              <div className="p-2.5 bg-muted rounded-xl text-foreground">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Design Studio</p>
                <p className="text-foreground mt-0.5">742 Evergreen Terrace, Seattle, WA 98101</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="p-8 border border-border rounded-3xl bg-card shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-lg">Send a Message</h3>
            <p className="text-xs text-muted-foreground mt-0.5 font-light">Fill out the form below and we will contact you shortly.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full bg-background border border-border px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you need help with..."
                rows={5}
                className="w-full bg-background border border-border px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                required
              />
            </div>

            {submitted && (
              <p className="text-xs text-green-600 font-semibold">
                Message sent successfully! Our representatives will contact you soon.
              </p>
            )}

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-foreground text-background text-xs font-bold py-3.5 rounded-xl hover:bg-neutral-800 transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" /> Send Message
            </button>
          </form>
        </section>

      </main>
      <Footer />
    </>
  );
}
