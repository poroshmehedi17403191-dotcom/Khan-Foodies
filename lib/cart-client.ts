import type { Product } from './types';

export type CartItem = { product: Product; quantity: number };

const CART_KEY = 'khanfoods_cart';

export function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function writeCart(cart: CartItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addProductToCart(product: Product, quantity = 1): CartItem[] {
  const cart = readCart();
  const idx = cart.findIndex((i) => i.product.id === product.id);
  let next: CartItem[];
  if (idx >= 0) {
    next = cart.map((item, i) =>
      i === idx ? { ...item, quantity: item.quantity + quantity } : item
    );
  } else {
    next = [...cart, { product, quantity }];
  }
  writeCart(next);
  return next;
}

export function cartItemCount(cart: CartItem[]): number {
  return cart.reduce((s, i) => s + i.quantity, 0);
}
