'use client';

import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Logo from '../../components/layout/Logo';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const FALLBACK_STORY = {
  title: 'Redefining Minimal Luxury',
  subtitle: 'We believe that products should be designed to last, executed with architectural precision, and stripped of unnecessary noise.',
  image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
  visionTitle: 'The Vision',
  visionText: 'Zedech was founded in 2026 out of a frustration with hyper-disposable fashion and tech. We set out to build an ecosystem of premium goods that integrate seamlessly into modern workspaces and lifestyles. We source high-grade sustainable materials and utilize precise, low-waste manufacturing processes.',
  craftTitle: 'The Craftsmanship',
  craftText: 'Every curve, thread, and interface is scrutinized in our design labs. From carbon-fiber plate integration in our athletic footwear to the sound acoustics in our active noise-canceling headphones, we blend engineering with premium aesthetics to deliver functional art.',
  pillarsTitle: 'Our Core Pillars',
  pillars: [
    {
      emoji: '📐',
      title: 'Architectural Design',
      description: 'Stripped back layouts, harmonious geometries, and intuitive ergonomics guide every collection.'
    },
    {
      emoji: '🔋',
      title: 'Optimal Performance',
      description: 'Whether it is speed on the track or clarity in high-definition audio, output is never compromised.'
    },
    {
      emoji: '🌍',
      title: 'Ethical Development',
      description: 'Sourcing materials from carbon-neutral suppliers and prioritizing fair labor conditions globally.'
    }
  ]
};

export default function AboutPage() {
  const [storyData, setStoryData] = useState(FALLBACK_STORY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const res = await fetch(`${API_URL}/cms/our_story`);
        const data = await res.json();
        if (data.success && data.value) {
          setStoryData(data.value);
        }
      } catch (err) {
        console.warn('API offline, falling back to static story presentation data.');
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
          >
            <div className="flex flex-col items-center space-y-6 text-center max-w-sm px-6">
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="relative flex items-center justify-center p-6 rounded-full bg-muted/30 border border-border"
              >
                <div className="absolute inset-0 rounded-full border border-t-foreground/30 border-r-transparent border-b-transparent border-l-transparent animate-spin duration-1000" />
                <Logo className="w-16 h-16 text-foreground" />
              </motion.div>
              <div className="relative w-40 h-0.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ left: '-100%' }}
                  animate={{ left: '100%' }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-0 bottom-0 w-1/2 bg-foreground rounded-full"
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold tracking-widest uppercase text-foreground">Zedech</h3>
                <p className="text-[10px] text-muted-foreground tracking-wide font-light">Loading our story...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <span className="text-xs uppercase font-extrabold tracking-widest text-muted-foreground">Our Story</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">{storyData.title}</h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto font-light leading-relaxed">
            {storyData.subtitle}
          </p>
        </section>

        {/* Brand Philosophy Image */}
        {storyData.image && (
          <section className="aspect-[21/9] w-full rounded-3xl bg-muted overflow-hidden border border-border shadow-sm">
            <img
              src={storyData.image}
              alt="Zedech design studio"
              className="w-full h-full object-cover"
            />
          </section>
        )}

        {/* Our Vision & Mission */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">{storyData.visionTitle}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-light">
              {storyData.visionText}
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">{storyData.craftTitle}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-light">
              {storyData.craftText}
            </p>
          </div>
        </section>

        {/* Core Values Grid */}
        <section className="border-t border-border pt-12 space-y-8">
          <h2 className="text-2xl font-bold text-center tracking-tight">{storyData.pillarsTitle}</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {storyData.pillars?.map((pillar, idx) => (
              <div key={idx} className="p-6 bg-card border border-border rounded-2xl text-center space-y-3 shadow-sm">
                <span className="text-2xl">{pillar.emoji}</span>
                <h3 className="font-bold text-sm">{pillar.title}</h3>
                <p className="text-xs text-muted-foreground font-light leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
