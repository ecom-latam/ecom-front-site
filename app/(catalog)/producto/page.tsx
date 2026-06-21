import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { Breadcrumbs } from 'zoui';
import { ProductDetailSection } from '@/components/catalog/ProductDetailSection';
import { RelatedProducts } from '@/components/catalog/RelatedProducts';
import { RatingsBlock } from '@/components/catalog/RatingsBlock';
import { getCategories, getProduct, getProductReviews, getStoreInfo } from '@/lib/api/storeClient';

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

  const [product, categories, storeInfo] = await Promise.all([
    getProduct(id),
    getCategories(),
    getStoreInfo(),
  ]);

  // EC-559: tiendas tipo "informativa" no tienen catalogo.
  if (storeInfo?.hasCatalog === false) {
    redirect('/');
  }

  const ratingsActive = storeInfo?.ratings_enabled || storeInfo?.reviews_enabled;
  const reviewsData = ratingsActive ? await getProductReviews(id, 3) : null;

  const category = categories.find((c) => c._id === String(product.categoryId));
  const displayPrice = product.salePrice ?? product.price;
  const hasDiscount = product.salePrice !== null && product.salePrice < product.price;

  const defaultStock = product.hasVariants
    ? Math.max(
        0,
        ...product.variants
          .filter((v) => v.enabled !== false)
          .map((v) => v.availableStock ?? v.stock)
      )
    : (product.availableStock ?? product.stock);

  const storeRatingsEnabled = storeInfo?.ratings_enabled ?? false;
  const storeReviewsEnabled = storeInfo?.reviews_enabled ?? false;

  const discountPercent = hasDiscount && product.salePrice
    ? Math.round((1 - product.salePrice / product.price) * 100)
    : null;

  const installmentsCount = storeInfo?.installments_count ?? null;
  const interestFree = storeInfo?.interest_free ?? false;
  const showInstallments = installmentsCount !== null && installmentsCount > 1;

  const breadcrumbItems = [
    { label: 'Tienda', href: '/productos' },
    ...(category ? [{ label: category.name, href: `/productos?categoryId=${category._id}` }] : []),
    { label: product.name },
  ];

  return (
    <main className="min-h-screen" style={{ background: 'var(--color-bg-surface)' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">

        <div style={{ marginBottom: '24px' }}>
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <ProductDetailSection
          product={product}
          hasSession={hasSession}
          defaultPrice={displayPrice}
          defaultStock={defaultStock}
          hasDiscount={hasDiscount}
          discountPercent={discountPercent}
          showInstallments={showInstallments}
          installmentsCount={installmentsCount}
          interestFree={interestFree}
          freeShippingMin={storeInfo?.free_shipping_min_amount}
          lowStockThreshold={storeInfo?.low_stock_threshold ?? 0}
          shareEnabled={storeInfo?.share_button_enabled ?? false}
          buyNowEnabled={storeInfo?.buy_now_enabled ?? false}
          returnsEnabled={storeInfo?.store_policies?.returns_enabled}
          returnDays={storeInfo?.store_policies?.return_days}
          warrantyEnabled={storeInfo?.store_policies?.warranty_enabled}
          warrantyMonths={storeInfo?.store_policies?.warranty_months}
          categoryName={category?.name}
          categoryId={category?._id}
        />

        {storeInfo?.related_products_enabled && category && (
          <RelatedProducts
            categoryId={String(category._id)}
            excludeId={id}
            currency={storeInfo.currency ?? 'ARS'}
          />
        )}

        {(storeRatingsEnabled || storeReviewsEnabled) && (
          <RatingsBlock
            avgRating={reviewsData?.avgRating ?? null}
            total={reviewsData?.total ?? 0}
            reviews={reviewsData?.data ?? []}
            distribution={reviewsData?.distribution ?? null}
            ratingsEnabled={storeRatingsEnabled}
            reviewsEnabled={storeReviewsEnabled}
          />
        )}
      </div>
    </main>
  );
}
