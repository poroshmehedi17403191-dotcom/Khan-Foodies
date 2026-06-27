'use client';

import Image from 'next/image';
import { User } from 'lucide-react';
import { Review, SiteContent } from '@/lib/types';
import { GlowLink } from '@/components/glow-button';
import { t } from '@/lib/i18n-bn';

interface AboutSectionProps {
  siteContent: SiteContent | null;
  reviews: Review[];
}

function AvatarBubble({ src, zIndex }: { src?: string; zIndex: number }) {
  if (src?.trim()) {
    return (
      <Image
        src={src}
        alt=""
        width={36}
        height={36}
        className="size-9 rounded-full border-[3px] border-white hover:-translate-y-1 transition object-cover"
        style={{ zIndex }}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center size-9 rounded-full border-[3px] border-white bg-[var(--kf-primary-light)] text-[var(--kf-primary)] hover:-translate-y-1 transition shrink-0"
      style={{ zIndex }}
      aria-hidden
    >
      <User className="w-4 h-4" />
    </div>
  );
}

export function AboutSection({ siteContent, reviews }: AboutSectionProps) {
  const aboutImage = siteContent?.aboutImage?.trim() || '';

  const rawText = siteContent?.aboutTextBn || siteContent?.aboutText || t.aboutDefault;
  const paragraphs = rawText.split(/\n\n+/).filter(Boolean);

  const reviewAvatars = reviews.slice(0, 3);
  const customerCount = reviews.length > 0 ? `${reviews.length}+` : '৫০+';

  return (
    <section
      id="about"
      className="font-[family-name:var(--font-poppins)] py-16 md:py-24 kf-section-muted border-y"
    >
      <div className="kf-container flex flex-col md:flex-row items-center justify-center gap-10 md:gap-14 px-2 sm:px-4">
        {aboutImage ? (
          <div className="relative shadow-2xl shadow-[color-mix(in_srgb,var(--kf-navy)_25%,transparent)] rounded-2xl overflow-hidden shrink-0 w-full max-w-md">
            <Image
              src={aboutImage}
              alt={siteContent?.aboutTitleBn || siteContent?.aboutTitle || 'About Khan Foods'}
              width={451}
              height={451}
              className="w-full max-w-md object-cover rounded-2xl aspect-square"
              referrerPolicy="no-referrer"
              sizes="(max-width: 768px) 100vw, 451px"
            />

            {reviewAvatars.length > 0 && (
              <div className="flex items-center gap-2 sm:gap-3 max-w-[calc(100%-2rem)] absolute bottom-6 sm:bottom-8 left-4 sm:left-8 bg-[var(--kf-card-bg)] p-3 sm:p-4 rounded-xl shadow-lg">
                <div className="flex -space-x-3 sm:-space-x-4 shrink-0">
                  {reviewAvatars.map((review, i) => (
                    <AvatarBubble key={review.id} src={review.image} zIndex={i + 1} />
                  ))}
                  <div
                    className="flex items-center justify-center text-xs text-white size-9 rounded-full border-[3px] border-white bg-[var(--kf-primary)] hover:-translate-y-1 transition shrink-0"
                    style={{ zIndex: 4 }}
                  >
                    {customerCount}
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-medium kf-heading leading-snug">{t.aboutCommunity}</p>
              </div>
            )}
          </div>
        ) : null}

        <div className={`text-sm kf-text-muted max-w-lg w-full ${aboutImage ? '' : 'mx-auto text-center'}`}>
          <span className="kf-badge mb-4">{t.aboutBadge}</span>

          <h2 className="text-xl uppercase font-semibold kf-heading">
            {siteContent?.aboutTitleBn || siteContent?.aboutTitle || t.aboutWhatWeDo}
          </h2>

          <div className={`w-24 h-[3px] rounded-full bg-gradient-to-r from-[var(--kf-navy)] to-[var(--kf-peach)] mt-3 ${aboutImage ? '' : 'mx-auto'}`} />

          <div className="mt-8 space-y-4">
            {paragraphs.map((para) => (
              <p key={para.slice(0, 24)}>{para}</p>
            ))}
          </div>

          <GlowLink href="#products" className={`mt-8 ${aboutImage ? '' : 'inline-flex'}`} innerClassName="flex items-center gap-2">
            <span>{t.aboutReadMore}</span>
            <svg width="13" height="12" viewBox="0 0 13 12" fill="none" aria-hidden>
              <path
                d="M12.53 6.53a.75.75 0 0 0 0-1.06L7.757.697a.75.75 0 1 0-1.06 1.06L10.939 6l-4.242 4.243a.75.75 0 0 0 1.06 1.06zM0 6v.75h12v-1.5H0z"
                fill="currentColor"
              />
            </svg>
          </GlowLink>
        </div>
      </div>
    </section>
  );
}
