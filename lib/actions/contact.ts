'use server';

import { getSlug } from '@/lib/api/storeClient';
import { client } from '@/lib/api/client';

// EC-947: mismo patron que lib/actions/newsletter.ts (EC-1045).
export async function submitContactMessage(data: { name: string; email: string; message: string }): Promise<void> {
  const slug = await getSlug();
  await client.post('/api/page/contact-messages', data, {
    headers: { 'X-Tenant-Slug': slug },
  });
}
