import { redirect } from 'next/navigation';
import { getPageInfo } from '@/lib/api/storeClient';
import { InformationalHome } from '@/components/catalog/InformationalHome';

// Tiendas tipo "informativa" (sin catalogo) muestran el contenido
// de ecom-page acá en vez de redirigir al catalogo, que no existe para ellas.
export default async function CatalogIndex() {
  const storeInfo = await getPageInfo();

  if (storeInfo?.hasCatalog === false) {
    return <InformationalHome storeInfo={storeInfo} />;
  }

  // Si alguna pagina del builder tiene isHome: true, esa es la que manda en
  // '/' -- ninguna pagina es home por default (no hay ninguna reservada),
  // asi que sin una marcada explicitamente cae al catalogo como siempre.
  const homePage = storeInfo?.pages?.find((p) => p.isHome);
  if (homePage) {
    redirect(`/${homePage.slug}`);
  }

  redirect(`/${storeInfo?.catalog_slug ?? 'productos'}`);
}
