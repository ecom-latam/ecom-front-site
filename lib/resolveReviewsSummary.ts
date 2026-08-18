import type { PageBlock } from 'zoui';
import { getReviewsSummary } from '@/lib/api/storeClient';

// A diferencia de product-showcase/category-showcase (seleccion curada por
// bloque), reviews-summary no tiene ids que resolver -- es un unico valor
// (el rating agregado de toda la tienda), asi que un solo fetch alcanza sin
// importar cuantos bloques reviews-summary tenga la pagina.
export async function resolveReviewsSummaryBlocks(blocks: PageBlock[]): Promise<PageBlock[]> {
  const hasReviewsSummary = blocks.some((b) => b.type === 'reviews-summary');
  if (!hasReviewsSummary) return blocks;

  const { avgRating, reviewCount } = await getReviewsSummary();

  return blocks.map((block) => {
    if (block.type !== 'reviews-summary') return block;
    return { ...block, props: { ...block.props, avgRating, reviewCount } };
  });
}
