import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { Text } from 'zoui';
import { AddToCartButton } from '@/components/catalog/AddToCartButton';
import { Price } from '@/components/catalog/Price';
import { getCategories, getProduct } from '@/lib/api/storeClient';

interface Props {
  searchParams: { id?: string };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const id = searchParams.id;
  if (!id) return {};
  try {
    const product = await getProduct(id);
    const mainImage = product.images.find((img) => img.isMain) ?? product.images[0];
    return {
      title: product.name,
      description: product.description || undefined,
      openGraph: {
        title: product.name,
        description: product.description || undefined,
        ...(mainImage ? { images: [mainImage.url] } : {}),
      },
    };
  } catch {
    return {};
  }
}

export default async function ProductoPage({ searchParams }: Props) {
  const id = searchParams.id;
  if (!id) notFound();

  const cookieStore = await cookies();
  const hasSession = cookieStore.has('_auth');

  const [product, categories] = await Promise.all([
    getProduct(id),
    getCategories(),
  ]);

  const category = categories.find((c) => c._id === String(product.categoryId));
  const mainImage = product.images.find((img) => img.isMain) ?? product.images[0];
  const secondaryImages = product.images.filter((img) => img !== mainImage);
  const displayPrice = product.salePrice ?? product.price;
  const hasDiscount = product.salePrice !== null && product.salePrice < product.price;

  const effectiveStock = product.hasVariants
    ? Math.max(
        0,
        ...product.variants
          .filter((v) => v.enabled !== false)
          .map((v) => v.availableStock ?? v.stock)
      )
    : (product.availableStock ?? product.stock);

  return (
    <main className="min-h-screen" style={{ background: 'var(--color-bg-surface)' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/productos" style={{ display: 'inline-block', marginBottom: '24px', textDecoration: 'none' }}>
          <Text variant="body-sm" color="muted">← Volver al catálogo</Text>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          <div className="flex flex-col gap-3">
            <div className="aspect-square rounded-lg overflow-hidden" style={{ background: 'var(--color-bg-subtle)' }}>
              {mainImage ? (
                <Image
                  src={mainImage.url}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="object-cover w-full h-full"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl" style={{ color: 'var(--color-fg-disabled)' }}>
                  □
                </div>
              )}
            </div>

            {secondaryImages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                {secondaryImages.map((img, i) => (
                  <div
                    key={i}
                    className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden"
                    style={{ background: 'var(--color-bg-subtle)' }}
                  >
                    <Image
                      src={img.url}
                      alt={`${product.name} ${i + 2}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            {category && (
              <Link href={`/productos?categoryId=${category._id}`} style={{ textDecoration: 'none', marginBottom: '8px', display: 'block' }}>
                <Text variant="overline" color="muted">{category.name}</Text>
              </Link>
            )}

            <Text variant="heading-2" as="h1">{product.name}</Text>

            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <Text variant="heading-1" as="span"><Price value={displayPrice} /></Text>
              {hasDiscount && (
                <Text variant="body" color="muted" as="span" style={{ textDecoration: 'line-through' }}>
                  <Price value={product.price} />
                </Text>
              )}
            </div>

            {product.description && (
              <Text variant="body-sm" color="secondary" as="p" style={{ marginTop: '16px', whiteSpace: 'pre-line' }}>
                {product.description}
              </Text>
            )}

            {product.hasVariants && product.linkedOptions.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <Text variant="body-sm" color="muted" as="p">
                  {product.linkedOptions.map((o) => o.storeOptionName).join(', ')}
                </Text>
              </div>
            )}

            {effectiveStock > 0 ? (
              <Text variant="body-sm" as="p" style={{ marginTop: '24px', color: 'var(--color-success-700)' }}>Disponible ({effectiveStock} disponibles)</Text>
            ) : (
              <Text variant="body-sm" as="p" style={{ marginTop: '24px', color: 'var(--color-error-500)' }}>Sin stock</Text>
            )}

            <AddToCartButton product={product} hasSession={hasSession} availableStock={effectiveStock} />
          </div>
        </div>
      </div>
    </main>
  );
}
