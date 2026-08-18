import type { PageBlock } from 'zoui';
import { getCategories, type Category } from '@/lib/api/storeClient';

// Mismo patron que resolveProductShowcase.ts: el editor solo persiste
// categoryIds (seleccion curada) -- este paso los resuelve a categorias
// reales antes de que DynamicPageRenderer los renderice, ya que zoui no hace
// fetching (CategoryShowcaseBlock recibe `categories`, no `categoryIds`).
// Corre server-side en el Server Component de la pagina.
export async function resolveCategoryShowcaseBlocks(blocks: PageBlock[], catalogSlug: string): Promise<PageBlock[]> {
  const showcaseBlocks = blocks.filter((b) => b.type === 'category-showcase');
  if (showcaseBlocks.length === 0) return blocks;

  const allIds = Array.from(new Set(showcaseBlocks.flatMap((b) => b.props.categoryIds ?? [])));
  if (allIds.length === 0) return blocks;

  const allCategories = await getCategories();
  const byId = new Map(allCategories.map((c) => [c._id, c]));

  function toShowcaseCategory(c: Category) {
    return { id: c._id, name: c.name, href: `/${catalogSlug}?categoryId=${c._id}` };
  }

  return blocks.map((block) => {
    if (block.type !== 'category-showcase') return block;
    const categories = (block.props.categoryIds ?? [])
      .map((id) => byId.get(id))
      .filter((c): c is Category => c !== undefined)
      .map(toShowcaseCategory);
    return { ...block, props: { ...block.props, categories } };
  });
}
