'use server';

import { getSlug } from '@/lib/api/storeClient';
import { client } from '@/lib/api/client';

// EC-945: primer Server Action del front-site -- se pasa como prop a
// DynamicPage (Client Component), Next.js resuelve el RPC cliente->servidor
// automaticamente. Si rechaza, NewsletterBlock (zoui) lo captura y muestra
// el estado de error, sin necesidad de manejarlo aca.
export async function subscribeToNewsletter(email: string): Promise<void> {
  const slug = await getSlug();
  await client.post('/api/page/newsletter-subscribers', { email }, {
    headers: { 'X-Tenant-Slug': slug },
  });
}
