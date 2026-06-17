'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  X,
  Check,
  Package,
} from 'lucide-react';
import { Button } from '@/components/button';
import {
  formatShippingFee,
  shippingFeeRangeLabel,
} from '@/lib/shipping';
import { t } from '@/lib/i18n-bn';
import type { StorefrontCartState } from '@/hooks/use-storefront-cart';

type StorefrontCartCheckoutProps = {
  cartState: StorefrontCartState;
  onExploreProducts?: () => void;
};

export function StorefrontCartCheckout({ cartState, onExploreProducts }: StorefrontCartCheckoutProps) {
  const {
    cart,
    showCart,
    setShowCart,
    showCheckout,
    setShowCheckout,
    orderSuccess,
    setOrderSuccess,
    checkoutForm,
    setCheckoutForm,
    isPending,
    updateCartQuantity,
    removeFromCart,
    openCheckout,
    handlePlaceOrder,
    subtotal,
    deliveryFee,
    total,
    cartIsFreeShipping,
    activeShipping,
    selectedShipping,
  } = cartState;

  return (
    <>
      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="absolute inset-0 bg-stone-950/40 backdrop-blur-sm"
            />

            <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="w-screen max-w-md bg-[var(--kf-card-bg)] shadow-2xl flex flex-col justify-between kf-safe-top kf-safe-bottom"
              >
                <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[var(--kf-primary)]" />
                    <h3 className="font-serif text-xl font-bold text-stone-900">{t.basketTitle}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCart(false)}
                    className="p-2 hover:bg-[var(--kf-primary-light)] hover:text-[var(--kf-primary)] rounded-full transition"
                  >
                    <X className="w-5 h-5 text-stone-800" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <ShoppingCart className="w-12 h-12 text-stone-200 mb-4 animate-bounce" />
                      <h4 className="font-serif text-lg font-bold text-stone-700">{t.basketEmpty}</h4>
                      <p className="text-[var(--kf-text)] text-sm mt-1 mb-6">{t.basketEmptySub}</p>
                      <Button
                        size="lg"
                        onClick={() => {
                          setShowCart(false);
                          onExploreProducts?.();
                        }}
                      >
                        {t.exploreProducts}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="bg-stone-50 border border-stone-100 p-4 rounded-2xl mb-2">
                        {subtotal >= 1500 ? (
                          <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                            <Check className="w-4 h-4" /> {t.freeDeliveryUnlocked}
                          </p>
                        ) : (
                          <div className="space-y-1.5">
                            <p className="text-xs text-stone-600">
                              {t.freeDeliveryProgress}{' '}
                              <span className="font-bold text-[var(--kf-primary)]">
                                {(1500 - subtotal).toLocaleString()} BDT
                              </span>{' '}
                              <span className="font-semibold text-emerald-700">{t.free}</span>!
                            </p>
                            <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${Math.min(100, (subtotal / 1500) * 100)}%` }}
                                className="h-full bg-[var(--kf-primary)] rounded-full transition-all duration-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {cart.map((item) => {
                        const activePrice = item.product.price * (1 - item.product.discount / 100);
                        return (
                          <div
                            key={item.product.id}
                            className="bg-stone-50 border border-stone-100/50 rounded-2xl p-4 flex gap-4 transition-all"
                          >
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-stone-100">
                              <Image
                                src={item.product.image}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>

                            <div className="flex-1 space-y-1">
                              <h4 className="font-serif font-bold text-[var(--kf-text)] text-sm line-clamp-1">
                                {item.product.nameBn || item.product.name}
                              </h4>
                              <p className="text-xs font-bold text-[var(--kf-primary)]">
                                {activePrice.toLocaleString()} BDT{' '}
                                {item.product.discount > 0 && (
                                  <span className="font-normal text-stone-400 line-through text-[10px]">
                                    {item.product.price.toLocaleString()} BDT
                                  </span>
                                )}
                              </p>

                              <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-2 border border-stone-200 dark:border-white/20 bg-white dark:bg-white/10 rounded-lg p-0.5">
                                  <button
                                    type="button"
                                    onClick={() => updateCartQuantity(item.product.id, -1)}
                                    className="p-1 hover:bg-[var(--kf-primary-light)] hover:text-[var(--kf-primary)] rounded text-stone-600 dark:text-white transition"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="text-xs font-black w-6 text-center text-stone-800 dark:text-white">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => updateCartQuantity(item.product.id, 1)}
                                    className="p-1 hover:bg-[var(--kf-primary-light)] hover:text-[var(--kf-primary)] rounded text-stone-600 dark:text-white transition"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeFromCart(item.product.id, item.product.nameBn || item.product.name)
                                  }
                                  className="text-stone-400 hover:text-[var(--kf-primary)] p-1.5 transition"
                                  title={t.removeItem}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="p-6 border-t border-stone-100 space-y-4">
                    <div className="space-y-2 text-sm text-[var(--kf-text)]">
                      <div className="flex justify-between">
                        <span className="text-stone-500 font-medium">{t.subtotal}</span>
                        <span className="font-bold">{subtotal.toLocaleString()} BDT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500 font-medium">{t.deliveryFee}</span>
                        <span className="font-bold">
                          {formatShippingFee(deliveryFee, subtotal, cart, t.free)}
                        </span>
                      </div>
                      {cartIsFreeShipping && subtotal > 0 && subtotal < 1500 && (
                        <p className="text-[10px] text-emerald-700 font-semibold">{t.freeShippingCartNote}</p>
                      )}
                      <div className="flex justify-between text-base pt-2 border-t font-black">
                        <span className="font-serif">{t.totalBill}</span>
                        <span className="text-[var(--kf-primary)] text-lg">
                          {(checkoutForm.deliveryZone || subtotal >= 1500 || cartIsFreeShipping
                            ? total
                            : subtotal
                          ).toLocaleString()}{' '}
                          BDT
                          {!checkoutForm.deliveryZone &&
                            subtotal > 0 &&
                            subtotal < 1500 &&
                            !cartIsFreeShipping && (
                              <span className="block text-[10px] font-medium text-stone-400 normal-case tracking-normal">
                                + {shippingFeeRangeLabel(activeShipping)}
                              </span>
                            )}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5 pt-2 md:grid md:grid-cols-2 md:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        className="py-3 text-sm md:py-2 md:text-xs"
                        onClick={() => setShowCart(false)}
                      >
                        {t.keepShopping}
                      </Button>
                      <Button
                        size="sm"
                        fullWidth
                        className="py-3 text-sm md:py-2 md:text-xs"
                        onClick={openCheckout}
                      >
                        {t.checkout}
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center kf-safe-modal">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCheckout(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative w-full max-w-lg bg-[var(--kf-card-bg)] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[var(--kf-border)] z-10 p-5 sm:p-8 flex flex-col justify-between max-h-[92vh] sm:max-h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setShowCheckout(false)}
                className="absolute top-4 right-4 p-2 bg-stone-50 hover:bg-[var(--kf-primary-light)] hover:text-[var(--kf-primary)] rounded-full transition"
              >
                <X className="w-5 h-5 text-stone-800" />
              </button>

              <div className="mb-6 flex items-center gap-2">
                <span className="p-2.5 bg-[var(--kf-peach)]/30 rounded-xl">
                  <Package className="w-5 h-5 text-[var(--kf-primary)]" />
                </span>
                <div>
                  <h3 className="font-serif text-2xl font-black text-stone-900">{t.secureCheckout}</h3>
                  <p className="text-xs text-stone-400 font-medium">{t.codNote}</p>
                </div>
              </div>

              <form onSubmit={handlePlaceOrder} className="space-y-5">
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[var(--kf-primary)] border-b border-[var(--kf-border)] pb-2">
                    {t.sectionContact}
                  </h4>
                  <div>
                    <label className="block text-[11px] uppercase font-bold tracking-widest text-[var(--kf-text)] mb-1">
                      {t.nameLabel}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t.namePlaceholder}
                      value={checkoutForm.name}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                      className="w-full text-stone-800 bg-stone-50 border border-stone-200 text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--kf-primary)]/20 focus:border-[var(--kf-primary)] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-bold tracking-widest text-[var(--kf-text)] mb-1">
                      {t.phoneLabel}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder={t.phonePlaceholder}
                      value={checkoutForm.phone}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                      className="w-full text-stone-800 bg-stone-50 border border-stone-200 text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--kf-primary)]/20 focus:border-[var(--kf-primary)] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-bold tracking-widest text-[var(--kf-text)] mb-1">
                      {t.checkoutEmailLabel}
                    </label>
                    <input
                      type="email"
                      placeholder={t.checkoutEmailPlaceholder}
                      value={checkoutForm.email}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                      className="w-full text-stone-800 bg-stone-50 border border-stone-200 text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--kf-primary)]/20 focus:border-[var(--kf-primary)] transition"
                    />
                    <p className="text-[10px] text-stone-400 mt-1">{t.checkoutEmailHint}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[var(--kf-primary)] border-b border-[var(--kf-border)] pb-2">
                    {t.sectionDelivery}
                  </h4>
                  <p className="text-xs text-stone-500">{t.selectDeliveryZone}</p>
                  {activeShipping.length === 0 ? (
                    <p className="text-xs text-stone-400">{t.noShippingZones}</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeShipping.map((zone) => {
                        const zoneFee = subtotal >= 1500 || cartIsFreeShipping ? 0 : zone.fee;
                        return (
                          <button
                            key={zone.id}
                            type="button"
                            onClick={() => setCheckoutForm({ ...checkoutForm, deliveryZone: zone.id })}
                            className={`p-4 rounded-xl border-2 text-left transition ${
                              checkoutForm.deliveryZone === zone.id
                                ? 'border-[var(--kf-primary)] bg-[var(--kf-primary-light)]/40 shadow-md'
                                : 'border-stone-200 bg-stone-50 hover:border-[var(--kf-peach)]'
                            }`}
                          >
                            <span className="block text-sm font-black text-stone-900">
                              {zone.nameBn || zone.name}
                            </span>
                            <span className="block text-xs font-bold text-[var(--kf-primary)] mt-1">
                              {zoneFee === 0 ? t.free : `${zone.fee.toLocaleString()} BDT`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {cartIsFreeShipping && subtotal > 0 && subtotal < 1500 && (
                    <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> {t.freeShippingCartNote}
                    </p>
                  )}
                  {subtotal >= 1500 && (
                    <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> {t.freeDeliveryUnlocked}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[var(--kf-primary)] border-b border-[var(--kf-border)] pb-2">
                    {t.sectionAddress}
                  </h4>
                  <div>
                    <label className="block text-[11px] uppercase font-bold tracking-widest text-[var(--kf-text)] mb-1">
                      {t.addressLabel}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t.addressPlaceholder}
                      value={checkoutForm.address}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                      className="w-full text-stone-800 bg-stone-50 border border-stone-200 text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--kf-primary)]/20 focus:border-[var(--kf-primary)] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-bold tracking-widest text-[var(--kf-text)] mb-1">
                      {t.notesLabel}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={t.notesPlaceholder}
                      value={checkoutForm.notes}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, notes: e.target.value })}
                      className="w-full text-stone-800 bg-stone-50 border border-stone-200 text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--kf-primary)]/20 focus:border-[var(--kf-primary)] transition"
                    />
                  </div>
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl space-y-2 mt-2 text-xs">
                  <h4 className="font-extrabold uppercase text-stone-600 tracking-wider">{t.orderSummary}</h4>
                  <div className="max-h-24 overflow-y-auto divide-y divide-stone-100">
                    {cart.map((item) => (
                      <div key={item.product.id} className="py-1.5 flex justify-between text-stone-700">
                        <span>
                          {item.product.nameBn || item.product.name} (x{item.quantity})
                        </span>
                        <span className="font-bold">
                          {(
                            item.product.price *
                            (1 - item.product.discount / 100) *
                            item.quantity
                          ).toLocaleString()}{' '}
                          BDT
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-1 flex justify-between text-stone-600">
                    <span>{t.subtotal}</span>
                    <span className="font-bold">{subtotal.toLocaleString()} BDT</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>{t.deliveryFee}</span>
                    <span className="font-bold">
                      {formatShippingFee(deliveryFee, subtotal, cart, t.free)}
                    </span>
                  </div>
                  {selectedShipping && deliveryFee > 0 && (
                    <p className="text-[10px] text-stone-500">
                      {selectedShipping.nameBn || selectedShipping.name}
                    </p>
                  )}
                  <div className="pt-2 border-t flex justify-between text-sm font-black text-stone-950">
                    <span>{t.totalBill}</span>
                    <span className="text-[var(--kf-primary)]">{total.toLocaleString()} BDT</span>
                  </div>
                </div>

                <Button type="submit" fullWidth size="md" disabled={isPending}>
                  {isPending ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      {t.securingOrder}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> {t.confirmOrder}
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {orderSuccess && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOrderSuccess(null)}
              className="absolute inset-0 bg-stone-950/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="relative w-full max-w-sm bg-[var(--kf-card-bg)] overflow-hidden shadow-2xl z-10 border border-[var(--kf-peach)]/40 dark:border-[var(--kf-border)]"
            >
              <div className="h-1.5 bg-gradient-to-r from-[var(--kf-navy)] via-[var(--kf-peach)] to-[var(--kf-navy)]" />

              <div className="p-7 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 400 }}
                  className="w-16 h-16 bg-emerald-50 border-2 border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5"
                >
                  <Check className="w-8 h-8 stroke-[3]" />
                </motion.div>

                <h3 className="font-serif text-2xl font-black text-stone-900 mb-2">{t.orderSuccessTitle}</h3>
                <p className="text-sm text-stone-600 leading-relaxed px-2 mb-1">{t.orderSuccessSub}</p>
                <p className="text-xs text-stone-400 mb-5">{t.orderSuccessCall}</p>

                <div className="bg-stone-50 border border-stone-100 p-4 mb-5 text-left space-y-2">
                  <div>
                    <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">
                      {t.orderNumberLabel}
                    </span>
                    <p className="font-mono font-black text-[var(--kf-primary)] text-lg tracking-wide">
                      {orderSuccess.orderNumber || 'KF-PENDING'}
                    </p>
                  </div>
                  <div className="flex justify-between text-xs pt-2 border-t border-stone-100">
                    <span className="text-stone-500">{t.total}</span>
                    <span className="font-black text-stone-900">{orderSuccess.amount?.toLocaleString()} BDT</span>
                  </div>
                </div>

                <Button fullWidth size="lg" onClick={() => setOrderSuccess(null)}>
                  {t.keepShopping}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
