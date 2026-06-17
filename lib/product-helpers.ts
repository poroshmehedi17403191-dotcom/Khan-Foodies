import type { Category, Product } from './types';
import { slugify } from './slug';

export function getProductSlug(product: Product): string {
  return product.slug?.trim() || slugify(product.name);
}

export function getProductImages(product: Product): string[] {
  const fromList = (product.images || []).filter(Boolean);
  if (fromList.length > 0) return fromList;
  if (product.image) return [product.image];
  return [];
}

export function getProductMainImage(product: Product): string {
  if (product.image) return product.image;
  const imgs = getProductImages(product);
  return imgs[0] || '';
}

export function getProductPath(product: Product, categories: Category[]): string {
  const cat = categories.find((c) => c.name === product.category);
  const categorySlug = cat?.slug || slugify(product.category);
  return `/${categorySlug}/${getProductSlug(product)}`;
}

export function normalizeProductImages(image: string, images?: string[]): { image: string; images: string[] } {
  const list = (images || []).filter(Boolean);
  if (list.length === 0 && image) return { image, images: [image] };
  const main = image && list.includes(image) ? image : list[0] || image;
  const merged = main && !list.includes(main) ? [main, ...list] : list.length ? list : main ? [main] : [];
  return { image: main || merged[0] || '', images: merged };
}
