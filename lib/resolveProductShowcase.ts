import type { PageBlock } from 'zoui';
import type { Currency } from '@/context/PageConfigContext';
import { getProducts, type Product } from '@/lib/api/storeClient';
import { formatPrice } from '@/lib/format';
import { getMainImage, getDisplayPrice, getEffectiveAvailableStock } from '@/lib/productDisplay';

// El editor solo persiste productIds (seleccion curada) -- este paso resuelve
// esos ids a productos reales antes de que DynamicPageRenderer los renderice,
// ya que zoui no hace fetching (ProductShowcaseBlock recibe `products`, no
// `productIds`). Corre server-side en el Server Component de la pagina.
export async function resolveProductShowcaseBlocks(blocks: PageBlock[], currency?: Currency): Promise<PageBlock[]> {
  const showcaseBlocks = blocks.filter((b) => b.type === 'product-showcase');
  if (showcaseBlocks.length === 0) return blocks;

  const allIds = Array.from(new Set(showcaseBlocks.flatMap((b) => b.props.productIds ?? [])));
  if (allIds.length === 0) return blocks;

  // sin limit explicito, getProducts usa el default de ecom-product (30) y
  // silenciosamente recortaria vitrinas curadas con mas ids que eso.
  const { data: products } = await getProducts({ ids: allIds, limit: allIds.length });
  const byId = new Map(products.map((p) => [p._id, p]));

  function toShowcaseProduct(p: Product) {
    const mainImage = getMainImage(p);
    const displayPrice = getDisplayPrice(p);
    const hasDiscount = p.salePrice !== null && p.salePrice < p.price;
    return {
      id:         p._id,
      name:       p.name,
      price:      formatPrice(displayPrice, currency),
      priceOld:   hasDiscount ? formatPrice(p.price, currency) : undefined,
      image:      mainImage ? { url: mainImage.url, alt: p.name } : undefined,
      href:       `/producto?id=${p._id}`,
      outOfStock: getEffectiveAvailableStock(p) === 0,
    };
  }

  return blocks.map((block) => {
    if (block.type !== 'product-showcase') return block;
    const products = (block.props.productIds ?? [])
      .map((id) => byId.get(id))
      .filter((p): p is Product => p !== undefined)
      .map(toShowcaseProduct);
    return { ...block, props: { ...block.props, products } };
  });
}
