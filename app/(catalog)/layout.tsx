import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { CatalogNavbar } from '@/components/catalog/CatalogNavbar';
import { CartDrawer } from '@/components/catalog/CartDrawer';
import { getStoreInfo } from '@/lib/api/storeClient';

export async function generateMetadata(): Promise<Metadata> {
  const info = await getStoreInfo();
  const name = info?.name ?? 'Tienda';
  return {
    title: {
      default: name,
      template: `%s | ${name}`,
    },
    description: info?.description ?? undefined,
    openGraph: {
      title: name,
      description: info?.description ?? undefined,
      ...(info?.logo_url ? { images: [info.logo_url] } : {}),
    },
  };
}

export default async function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has('_auth');

  return (
    <>
      <CatalogNavbar isLoggedIn={isLoggedIn} />
      <CartDrawer />
      {children}
    </>
  );
}
