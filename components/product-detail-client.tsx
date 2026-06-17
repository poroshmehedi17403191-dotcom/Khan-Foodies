'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Star, ShoppingBag, Truck, ChevronRight, Check } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { PromoBanner } from '@/components/promo-banner';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/button';
import { FreeDeliveryBadge } from '@/components/free-delivery-badge';
import { StorefrontCartCheckout } from '@/components/storefront-cart-checkout';
import { Category, Product, SiteContent, ShippingCharge } from '@/lib/types';
import { getProductImages, getProductPath } from '@/lib/product-helpers';
import { useStorefrontCart } from '@/hooks/use-storefront-cart';
import { t } from '@/lib/i18n-bn';

type ProductDetailClientProps = {
  product: Product;
  category: Category;
  related: Product[];
  categories: Category[];
  siteContent: SiteContent | null;
  shippingCharges: ShippingCharge[];
};

type ToastMessage = { id: number; message: string; type: 'success' | 'error' | 'info' };

export function ProductDetailClient({
  product,
  category,
  related,
  categories,
  siteContent,
  shippingCharges,
}: ProductDetailClientProps) {
  const images = getProductImages(product);
  const [activeImage, setActiveImage] = useState(product.image || images[0] || '');
  const [qty, setQty] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastCounterRef = useRef(0);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    toastCounterRef.current += 1;
    const id = toastCounterRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const cartState = useStorefrontCart(shippingCharges, { onToast: showToast });

  const discounted = product.price * (1 - product.discount / 100);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    cartState.addToCart(product, qty, { openCart: true });
  };

  const handleBuyNow = () => {
    cartState.addToCart(product, qty, { openCart: false, openCheckout: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--kf-bg)]">
      <PromoBanner />
      <Navbar
        cartCount={cartState.cartCount}
        onCartOpen={() => cartState.setShowCart(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sectionBase="/"
      />

      <main className="flex-1 kf-container px-2 sm:px-4 py-6 sm:py-10">
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--kf-text-muted)] mb-6">
          <Link href="/" className="hover:text-[var(--kf-primary)]">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/#products" className="hover:text-[var(--kf-primary)]">
            {category.nameBn || category.name}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[var(--kf-text)] font-medium truncate max-w-[200px]">
            {product.nameBn || product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
          <div className="space-y-3">
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-[var(--kf-border)] shadow-sm group cursor-zoom-in">
              <Image
                src={activeImage}
                alt={product.nameBn || product.name}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.12]"
                priority
                referrerPolicy="no-referrer"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {product.freeShipping && (
                <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
                  <FreeDeliveryBadge size="md" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setActiveImage(url)}
                    className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition ${
                      activeImage === url
                        ? 'border-[var(--kf-primary)]'
                        : 'border-stone-200 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <Image src={url} alt="" fill className="object-cover" referrerPolicy="no-referrer" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-widest font-black text-[var(--kf-primary)] mb-2">
              {category.nameBn || category.name}
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--kf-text)] leading-tight">
              {product.nameBn || product.name}
            </h1>

            <div className="flex items-center gap-2 mt-3">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-stone-600">{product.rating.toFixed(1)}</span>
            </div>

            <div className="mt-5 flex items-baseline gap-3 flex-wrap">
              {product.discount > 0 ? (
                <>
                  <span className="text-3xl font-black text-[var(--kf-primary)]">
                    ৳{discounted.toLocaleString('bn-BD')}
                  </span>
                  <span className="text-lg text-stone-400 line-through">
                    ৳{product.price.toLocaleString('bn-BD')}
                  </span>
                  <span className="text-xs font-black uppercase bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                    {t.savePercent} {product.discount}%
                  </span>
                </>
              ) : (
                <span className="text-3xl font-black text-[var(--kf-primary)]">
                  ৳{product.price.toLocaleString('bn-BD')}
                </span>
              )}
            </div>

            {product.freeShipping && (
              <p className="mt-3 text-sm text-emerald-700 font-semibold flex items-center gap-1.5">
                <Truck className="w-4 h-4" />
                {t.freeShippingProduct}
              </p>
            )}

            <p className="mt-5 text-sm sm:text-base text-[var(--kf-text-muted)] leading-relaxed whitespace-pre-line">
              {product.descriptionBn || product.description}
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Qty</span>
                <div className="flex items-center border border-stone-200 rounded-xl bg-white">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="p-3 hover:bg-stone-50 rounded-l-xl"
                    aria-label="Decrease"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-black">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => q + 1)}
                    className="p-3 hover:bg-stone-50 rounded-r-xl"
                    aria-label="Increase"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button fullWidth size="lg" disabled={isOutOfStock} onClick={handleAddToCart}>
                  <ShoppingBag className="w-5 h-5" />
                  {isOutOfStock ? t.outOfStock : t.addToCartFull}
                </Button>
                <Button variant="outline" fullWidth size="lg" disabled={isOutOfStock} onClick={handleBuyNow}>
                  {t.checkout}
                </Button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--kf-border)] space-y-2 text-sm text-stone-600">
              <p className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[var(--kf-primary)]" />
                {t.codNote}
              </p>
              <p className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                {t.purityValue}
              </p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16 pt-10 border-t border-[var(--kf-border)]">
            <h2 className="font-serif text-2xl font-black mb-6">{t.productsTitle}</h2>
            <div className="product-cards">
              <div className="pc-grid">
                {related.map((p, idx) => {
                  const catMatch = categories.find((c) => c.name === p.category);
                  return (
                    <ProductCard
                      key={p.id}
                      product={p}
                      index={idx}
                      categoryLabel={catMatch?.nameBn || catMatch?.name || p.category}
                      productHref={getProductPath(p, categories)}
                      onAddToCart={() => cartState.addToCart(p, 1, { openCart: true })}
                    />
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer siteContent={siteContent} categories={categories} sectionBase="/" />

      <StorefrontCartCheckout cartState={cartState} />

      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[70] flex flex-col gap-2 pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white animate-in slide-in-from-right ${
                toast.type === 'error'
                  ? 'bg-red-600'
                  : toast.type === 'info'
                    ? 'bg-stone-800'
                    : 'bg-emerald-600'
              }`}
            >
              {toast.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
