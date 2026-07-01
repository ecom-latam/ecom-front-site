import type { Metadata } from 'next';
import { IllustrationMessage } from 'zoui';
import { CatalogNavbar } from '@/components/catalog/CatalogNavbar';
import { CartDrawer } from '@/components/catalog/CartDrawer';
import { PromoBar } from '@/components/catalog/PromoBar';
import { getPageInfo } from '@/lib/api/storeClient';
import { ILLUSTRATION_MESSAGES } from '@/lib/illustrationMessages';

export async function generateMetadata(): Promise<Metadata> {
  const info = await getPageInfo();
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
  const info = await getPageInfo();

  if (info?.maintenanceMode) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <IllustrationMessage {...ILLUSTRATION_MESSAGES['under-construction']} />
      </div>
    );
  }

  // Si la tienda no tiene ninguna sección activa ni páginas con contenido,
  // omitir navbar y chrome completo — el hijo renderiza la pantalla "en construcción".
  const hasNavItems =
    info?.hasCatalog === true ||
    info?.hasPurchases === true ||
    (info?.pages ?? []).some((p) => p.blocks.length > 0);

  if (!hasNavItems) {
    return <>{children}</>;
  }

  return (
    <>
      <PromoBar position="above-navbar" />
      <CatalogNavbar />
      <PromoBar position="below-navbar" />
      <CartDrawer />
      {children}
      <PromoBar position="footer" />
    </>
  );
}
