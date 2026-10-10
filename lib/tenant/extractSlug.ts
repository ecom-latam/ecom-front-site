import { NextRequest } from 'next/server';

const SITE_BASE_DOMAIN = (process.env.NEXT_PUBLIC_SITE_BASE_DOMAIN ?? 'ecom.com').replace(/\./g, '\\.');
const PROD_HOST = new RegExp(`^([^.]+)\\.${SITE_BASE_DOMAIN}(:\\d+)?$`);

export function extractSlugFromRequest(req: NextRequest): string | null {
  const host = req.headers.get('host') ?? '';
  const prodMatch = host.match(PROD_HOST);
  if (prodMatch) return prodMatch[1];
  const devMatch = host.match(/^([^.]+)\.localhost(:\d+)?$/);
  if (devMatch) return devMatch[1];
  return null;
}
