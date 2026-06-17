'use client';

import { useEffect, useState, useTransition } from 'react';
import { placeStoreOrder } from '@/app/actions';
import { trackAddToCartMetaAction, trackInitiateCheckoutMetaAction } from '@/app/meta-tracking';
import {
  buildMetaCustomData,
  generateMetaEventId,
  getMetaBrowserContext,
  trackMetaBrowserEvent,
} from '@/lib/meta-events';
import {
  cartItemCount,
  readCart,
  writeCart,
  type CartItem,
} from '@/lib/cart-client';
import {
  cartQualifiesForFreeShipping,
  computeDeliveryFee,
} from '@/lib/shipping';
import type { Product, ShippingCharge, Order } from '@/lib/types';
import { t } from '@/lib/i18n-bn';

export type ShowToast = (message: string, type?: 'success' | 'error' | 'info') => void;

export type AddToCartOptions = {
  openCart?: boolean;
  openCheckout?: boolean;
};

function metaProductPayload(product: Product, quantity = 1) {
  const price = product.price * (1 - product.discount / 100);
  return {
    productId: product.id,
    name: product.nameBn || product.name,
    price,
    quantity,
    category: product.category,
  };
}

function metaCartPayload(items: CartItem[]) {
  return {
    items: items.map((item) => metaProductPayload(item.product, item.quantity)),
    value: items.reduce((sum, item) => {
      const price = item.product.price * (1 - item.product.discount / 100);
      return sum + price * item.quantity;
    }, 0),
  };
}

export function useStorefrontCart(
  shippingCharges: ShippingCharge[],
  options?: { onToast?: ShowToast }
) {
  const showToast = options?.onToast ?? (() => {});

  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    deliveryZone: '',
  });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setCart(readCart());
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    writeCart(newCart);
  };

  const addToCart = (product: Product, quantity = 1, opts: AddToCartOptions = {}) => {
    const { openCart = true, openCheckout = false } = opts;
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    let newCart = [...cart];

    if (existingIndex > -1) {
      const nextQty = newCart[existingIndex].quantity + quantity;
      if (nextQty > product.stock) {
        showToast(`Cannot add more than ${product.stock} units of ${product.name}!`, 'error');
        return;
      }
      newCart[existingIndex].quantity = nextQty;
    } else {
      if (quantity > product.stock) {
        showToast(`Only ${product.stock} units available!`, 'error');
        return;
      }
      newCart.push({ product, quantity });
    }

    saveCart(newCart);
    showToast(`${product.nameBn || product.name} কার্টে যুক্ত হয়েছে!`, 'success');

    const payload = metaProductPayload(product, quantity);
    const eventId = generateMetaEventId('AddToCart');
    const browser = getMetaBrowserContext();
    trackMetaBrowserEvent(
      'AddToCart',
      buildMetaCustomData(
        [{ productId: payload.productId, price: payload.price, quantity: payload.quantity }],
        payload.price * payload.quantity
      ),
      eventId
    );
    void trackAddToCartMetaAction({ ...payload, eventId, browser });

    if (openCheckout) {
      const checkoutPayload = metaCartPayload(newCart);
      const checkoutEventId = generateMetaEventId('InitiateCheckout');
      trackMetaBrowserEvent(
        'InitiateCheckout',
        buildMetaCustomData(
          checkoutPayload.items.map((i) => ({
            productId: i.productId,
            price: i.price,
            quantity: i.quantity,
          })),
          checkoutPayload.value
        ),
        checkoutEventId
      );
      void trackInitiateCheckoutMetaAction({ ...checkoutPayload, eventId: checkoutEventId, browser });
      setShowCart(false);
      setShowCheckout(true);
    } else if (openCart) {
      setShowCart(true);
    }
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    const newCart = cart
      .map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty > item.product.stock) {
            showToast(`Only ${item.product.stock} items currently in stock!`, 'error');
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    saveCart(newCart);
  };

  const removeFromCart = (productId: string, name: string) => {
    saveCart(cart.filter((item) => item.product.id !== productId));
    showToast(`${name} removed from cart.`, 'info');
  };

  const openCheckout = () => {
    if (cart.length > 0) {
      const payload = metaCartPayload(cart);
      const eventId = generateMetaEventId('InitiateCheckout');
      const browser = getMetaBrowserContext();
      trackMetaBrowserEvent(
        'InitiateCheckout',
        buildMetaCustomData(
          payload.items.map((i) => ({ productId: i.productId, price: i.price, quantity: i.quantity })),
          payload.value
        ),
        eventId
      );
      void trackInitiateCheckoutMetaAction({ ...payload, eventId, browser });
    }
    setShowCart(false);
    setShowCheckout(true);
  };

  const subtotal = cart.reduce((sum, item) => {
    const activePrice = item.product.price * (1 - item.product.discount / 100);
    return sum + activePrice * item.quantity;
  }, 0);

  const activeShipping = shippingCharges.filter((z) => z.active);
  const cartIsFreeShipping = cartQualifiesForFreeShipping(cart);
  const deliveryFee = computeDeliveryFee(subtotal, cart, checkoutForm.deliveryZone, activeShipping);
  const total = subtotal + deliveryFee;
  const selectedShipping = activeShipping.find((z) => z.id === checkoutForm.deliveryZone);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutForm.name || !checkoutForm.phone || !checkoutForm.address) {
      showToast('নাম, ফোন ও ঠিকানা পূরণ করুন!', 'error');
      return;
    }
    if (!cartIsFreeShipping && subtotal < 1500 && !checkoutForm.deliveryZone) {
      showToast(t.deliveryZoneRequired, 'error');
      return;
    }

    const zoneLabel = selectedShipping
      ? `${selectedShipping.nameBn || selectedShipping.name} — ${deliveryFee.toLocaleString()} BDT`
      : cartIsFreeShipping
        ? t.freeShippingCartNote
        : subtotal >= 1500
          ? t.freeDeliveryUnlocked
          : '';
    const combinedNotes = [zoneLabel, checkoutForm.notes].filter(Boolean).join(' | ');

    const orderItems = cart.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price * (1 - item.product.discount / 100),
      quantity: item.quantity,
    }));

    startTransition(async () => {
      const browser = getMetaBrowserContext();
      const purchaseEventId = generateMetaEventId('Purchase');
      trackMetaBrowserEvent(
        'Purchase',
        buildMetaCustomData(
          orderItems.map((i) => ({ productId: i.productId, price: i.price, quantity: i.quantity })),
          total
        ),
        purchaseEventId,
        {
          email: checkoutForm.email.trim() || undefined,
          phone: checkoutForm.phone,
        }
      );

      const res = await placeStoreOrder(
        {
          name: checkoutForm.name,
          phone: checkoutForm.phone,
          email: checkoutForm.email.trim() || undefined,
          address: checkoutForm.address,
          notes: combinedNotes,
        },
        orderItems,
        total,
        { eventId: purchaseEventId, browser }
      );

      if (res.success && res.order) {
        setOrderSuccess(res.order);
        saveCart([]);
        setShowCheckout(false);
        setCheckoutForm({ name: '', phone: '', email: '', address: '', notes: '', deliveryZone: '' });
        showToast('অর্ডার কনফার্ম হয়েছে!', 'success');
      } else {
        showToast(res.error || 'Failed to place order', 'error');
      }
    });
  };

  return {
    cart,
    cartCount: cartItemCount(cart),
    showCart,
    setShowCart,
    showCheckout,
    setShowCheckout,
    orderSuccess,
    setOrderSuccess,
    checkoutForm,
    setCheckoutForm,
    isPending,
    addToCart,
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
  };
}

export type StorefrontCartState = ReturnType<typeof useStorefrontCart>;
