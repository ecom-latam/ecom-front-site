import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/lib/api/storeClient';
import { DynamicPage } from '@/components/catalog/DynamicPage';

// Pagina dinamica del page builder (cualquier slug que no sea
// 'home', que vive en (catalog)/page.tsx). 'home' nunca llega hasta acá --
// Next no matchea /[pageSlug] contra /, solo contra /<algo>.
export async function generateMetadata({ params }: { params: { pageSlug: string } }): Promise<Metadata> {
  const page = await getPageBySlug(params.pageSlug);
  return { title: page?.title || undefined };
}

export default async function DynamicPageRoute({ params }: { params: { pageSlug: string } }) {
  const page = await getPageBySlug(params.pageSlug);

  if (!page) {
    notFound();
  }

  return <DynamicPage page={page} />;
}
