import type { Product } from '@/lib/api/storeClient';

export function getMainImage(p: Product) {
  return p.images.find((img) => img.isMain) ?? p.images[0];
}

export function getDisplayPrice(p: Product) {
  return p.salePrice ?? p.price;
}

export function getDiscount(p: Product) {
  if (!p.salePrice || p.salePrice >= p.price) return undefined;
  return `−${Math.round((1 - p.salePrice / p.price) * 100)}%`;
}

export function getEffectiveAvailableStock(p: Product): number {
  if (!p.hasVariants) return p.availableStock ?? p.stock;
  const stocks = p.variants
    .filter((v) => v.enabled !== false)
    .map((v) => v.availableStock ?? v.stock);
  return stocks.length === 0 ? 0 : Math.max(...stocks);
}
