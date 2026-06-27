'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { GlowLink } from '@/components/glow-button';
import { HeroInteractiveBg } from '@/components/hero-interactive-bg';
import { t } from '@/lib/i18n-bn';

const SLIDE_INTERVAL_MS = 5000;

interface HeroSectionProps {
  headline?: string;
  subheadline?: string;
  images?: string[];
}

function HeroImageSlider({ slides }: { slides: string[] }) {
  const uniqueSlides = useMemo(
    () => slides.map((url) => url.trim()).filter(Boolean).filter((url, i, arr) => arr.indexOf(url) === i),
    [slides]
  );

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [uniqueSlides.join('|')]);

  useEffect(() => {
    if (uniqueSlides.length <= 1 || paused) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % uniqueSlides.length);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [uniqueSlides.length, uniqueSlides.join('|'), paused]);

  if (uniqueSlides.length === 0) return null;

  return (
    <div
      className="relative w-full max-w-[280px] sm:max-w-xs md:max-w-sm aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/25 shrink-0 mx-auto md:mx-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Hero product gallery"
    >
      {uniqueSlides.map((src, i) => (
        <div
          key={`${i}-${src}`}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === index ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
          aria-hidden={i !== index}
        >
          <Image
            src={src}
            alt=""
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
            priority={i === 0}
            sizes="(max-width: 768px) 280px, 384px"
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-[#1a234d]/35 via-transparent to-transparent pointer-events-none z-20" />

      {uniqueSlides.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-30">
          {uniqueSlides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Slide ${i + 1}`}
              aria-current={i === index ? 'true' : undefined}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-[var(--kf-peach)]' : 'w-1.5 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function HeroSection({ headline, subheadline, images = [] }: HeroSectionProps) {
  const heroSlides = images.filter((url): url is string => Boolean(url?.trim()));

  return (
    <section className="hero-section font-[family-name:var(--font-poppins)]">
      <HeroInteractiveBg />
      <main className="relative z-10 kf-container flex flex-col md:flex-row items-center max-md:text-center justify-between pt-8 pb-16 md:pt-12 px-2 sm:px-4 gap-10">
        <div className="flex flex-col items-center md:items-start max-w-xl">
          <a
            href="#products"
            className="mb-6 flex items-center space-x-2 border border-white/40 text-white text-xs rounded-full px-4 pr-1.5 py-1.5 hover:bg-white/10 transition backdrop-blur-sm"
          >
            <span>{t.heroBadge}</span>
            <span className="flex items-center justify-center size-6 p-1 rounded-full bg-[var(--kf-peach)]">
              <svg width="14" height="11" viewBox="0 0 16 13" fill="none" aria-hidden>
                <path
                  d="M1 6.5h14M9.5 1 15 6.5 9.5 12"
                  stroke="#1a234d"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </a>

          <h1 className="text-[var(--kf-hero-text)] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
            {headline ? (
              headline
            ) : (
              <>
                {t.heroLead}{' '}
                <span className="text-[var(--kf-peach)]">{t.heroAccent}</span>
              </>
            )}
          </h1>

          <p className="mt-4 text-[var(--kf-hero-text-muted)] max-w-md text-sm sm:text-base leading-relaxed">
            {subheadline}
          </p>

          <div className="flex flex-col sm:flex-row items-center mt-8 gap-3 w-full sm:w-auto">
            <GlowLink
              href="#products"
              innerClassName="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              {t.heroCtaStories}
              <ArrowRight className="w-5 h-5" aria-hidden />
            </GlowLink>
            <a
              href="#contact"
              className="kf-btn kf-btn-hero-outline kf-btn--md w-full sm:w-auto text-center"
            >
              {t.heroCtaStart}
            </a>
          </div>
        </div>

        <HeroImageSlider slides={heroSlides} />
      </main>
    </section>
  );
}
