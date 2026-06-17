import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { ProductDetailClient } from '@/components/product-detail-client';

type PageProps = {
  params: Promise<{ categorySlug: string; productSlug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorySlug, productSlug } = await params;
  const data = await db.getProductPageData(categorySlug, productSlug);
  if (!data) return { title: 'Product Not Found' };

  const title = data.product.nameBn || data.product.name;
  const description = data.product.descriptionBn || data.product.description;

  return {
    title,
    description: description.slice(0, 160),
    openGraph: {
      title,
      description: description.slice(0, 160),
      images: data.product.image ? [{ url: data.product.image }] : [],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { categorySlug, productSlug } = await params;
  const data = await db.getProductPageData(categorySlug, productSlug);
  if (!data) notFound();

  const [categories, siteContent, shippingCharges] = await Promise.all([
    db.getCategories(),
    db.getSiteContent(),
    db.getShippingCharges(),
  ]);

  return (
    <ProductDetailClient
      product={data.product}
      category={data.category}
      related={data.related}
      categories={categories}
      siteContent={siteContent}
      shippingCharges={shippingCharges}
    />
  );
}
