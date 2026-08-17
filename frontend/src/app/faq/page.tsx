'use client';

import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Logo from '../../components/layout/Logo';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FALLBACK_FAQS: FAQItem[] = [
  {
    category: 'Shipping',
    question: 'How long does shipping take?',
    answer: 'Standard shipping takes 3–5 business days within the continental United States. International orders usually arrive in 7–14 business days. Priority shipping is available at checkout for expedited delivery.'
  },
  {
    category: 'Shipping',
    question: 'Do you offer free shipping?',
    answer: 'Yes! We offer free complimentary standard shipping on all orders over $150. For orders under $150, a standard shipping fee of $15 applies.'
  },
  {
    category: 'Returns',
    question: 'What is your return policy?',
    answer: 'We accept returns on all unworn, unused items with original tags intact within 30 days of purchase. Returns can be easily initiated from your user profile order history panel.'
  },
  {
    category: 'Returns',
    question: 'Are returns free?',
    answer: 'Yes. Once a return request is approved in your profile, we generate a pre-paid courier shipping label for you to print and attach to your package.'
  },
  {
    category: 'Products',
    question: 'Are your items authentic?',
    answer: 'Absolutely. We design, manufacture, and sell all products directly. We do not source from third-party resellers, ensuring that every product you buy is 100% authentic and covered under our manufacturer warranty.'
  },
  {
    category: 'Payments',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), Apple Pay, Google Pay, and PayPal.'
  }
];

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>(FALLBACK_FAQS);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [loading, setLoading] = useState(true);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await fetch(`${API_URL}/cms/faqs`);
        const data = await res.json();
        if (data.success && Array.isArray(data.value)) {
          setFaqs(data.value);
        }
      } catch (err) {
        console.warn('API offline, falling back to static FAQ list.');
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
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
                <p className="text-[10px] text-muted-foreground tracking-wide font-light">Loading FAQs...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-2.5">
          <span className="text-xs uppercase font-extrabold tracking-widest text-muted-foreground">FAQ</span>
          <h1 className="text-4xl font-extrabold tracking-tight">Frequently Asked Questions</h1>
          <p className="text-muted-foreground text-sm font-light">Find answers to common questions about shipping, returns, and payments.</p>
        </div>

        {/* Accordions */}
        <section className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-border rounded-2xl bg-card overflow-hidden transition-all duration-300 shadow-sm"
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full flex justify-between items-center px-6 py-4.5 text-left font-semibold text-sm hover:bg-muted/40 transition-colors focus:outline-none"
                >
                  <span className="flex items-center gap-2.5">
                    {faq.category && (
                      <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {faq.category}
                      </span>
                    )}
                    {faq.question}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs text-muted-foreground leading-relaxed font-light border-t border-border/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* Support Callout */}
        <section className="text-center p-8 bg-muted/40 border border-border rounded-3xl space-y-4">
          <h3 className="font-bold text-sm">Still have questions?</h3>
          <p className="text-xs text-muted-foreground font-light max-w-sm mx-auto">
            Our support representatives are active 24/7. Send us a message and we will respond within 4 hours.
          </p>
          <button
            onClick={() => window.location.href = '/contact'}
            className="bg-foreground text-background text-xs font-bold px-6 py-2.5 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Contact Support
          </button>
        </section>
      </main>
      <Footer />
    </>
  );
}
