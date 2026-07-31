'use client';

import React from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 space-y-16">
        
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <span className="text-xs uppercase font-extrabold tracking-widest text-muted-foreground">Our Story</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Redefining Minimal Luxury</h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto font-light leading-relaxed">
            We believe that products should be designed to last, executed with architectural precision, and stripped of unnecessary noise.
          </p>
        </section>

        {/* Brand Philosophy Image */}
        <section className="aspect-[21/9] w-full rounded-3xl bg-muted overflow-hidden border border-border shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80"
            alt="Zedech design studio"
            className="w-full h-full object-cover"
          />
        </section>

        {/* Our Vision & Mission */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">The Vision</h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-light">
              Zedech was founded in 2026 out of a frustration with hyper-disposable fashion and tech. We set out to build an ecosystem of premium goods that integrate seamlessly into modern workspaces and lifestyles. We source high-grade sustainable materials and utilize precise, low-waste manufacturing processes.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">The Craftsmanship</h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-light">
              Every curve, thread, and interface is scrutinized in our design labs. From carbon-fiber plate integration in our athletic footwear to the sound acoustics in our active noise-canceling headphones, we blend engineering with premium aesthetics to deliver functional art.
            </p>
          </div>
        </section>

        {/* Core Values Grid */}
        <section className="border-t border-border pt-12 space-y-8">
          <h2 className="text-2xl font-bold text-center tracking-tight">Our Core Pillars</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="p-6 bg-card border border-border rounded-2xl text-center space-y-3 shadow-sm">
              <span className="text-2xl">📐</span>
              <h3 className="font-bold text-sm">Architectural Design</h3>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">
                Stripped back layouts, harmonious geometries, and intuitive ergonomics guide every collection.
              </p>
            </div>
            
            <div className="p-6 bg-card border border-border rounded-2xl text-center space-y-3 shadow-sm">
              <span className="text-2xl">🔋</span>
              <h3 className="font-bold text-sm">Optimal Performance</h3>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">
                Whether it is speed on the track or clarity in high-definition audio, output is never compromised.
              </p>
            </div>

            <div className="p-6 bg-card border border-border rounded-2xl text-center space-y-3 shadow-sm">
              <span className="text-2xl">🌍</span>
              <h3 className="font-bold text-sm">Ethical Development</h3>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">
                Sourcing materials from carbon-neutral suppliers and prioritizing fair labor conditions globally.
              </p>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
