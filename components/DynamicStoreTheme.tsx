'use client';

import { useState, useEffect } from 'react';
import { StoreConfigContext } from '@/context/StoreConfigContext';
import type { StoreConfig } from '@/context/StoreConfigContext';

const SESSION_KEY = 'store-theme-config';
const BFF_URL = process.env.NEXT_PUBLIC_BFF_URL ?? 'http://localhost:4000';

function applyBrandHue(hue: number) {
  const root = document.documentElement;
  const contrast = hue >= 45 && hue <= 75 ? '#000000' : '#ffffff';
  root.style.setProperty('--color-brand-50',       `hsl(${hue}, 95%, 97%)`);
  root.style.setProperty('--color-brand-100',      `hsl(${hue}, 90%, 93%)`);
  root.style.setProperty('--color-brand-200',      `hsl(${hue}, 85%, 86%)`);
  root.style.setProperty('--color-brand-300',      `hsl(${hue}, 80%, 75%)`);
  root.style.setProperty('--color-brand-400',      `hsl(${hue}, 75%, 62%)`);
  root.style.setProperty('--color-brand-500',      `hsl(${hue}, 72%, 50%)`);
  root.style.setProperty('--color-brand-600',      `hsl(${hue}, 75%, 42%)`);
  root.style.setProperty('--color-brand-700',      `hsl(${hue}, 80%, 34%)`);
  root.style.setProperty('--color-brand-contrast', contrast);
}

function applyFont(fontFamily: string) {
  document.documentElement.style.setProperty('--font-ui', `'${fontFamily}', sans-serif`);
}

function applyStoreTheme(buttonVariant: string) {
  document.documentElement.setAttribute('data-store-theme', buttonVariant);
}

function getSlug(): string {
  return window.location.hostname.split('.')[0];
}

function readSession(): Record<string, unknown> | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSession(config: Record<string, unknown>): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(config));
  } catch {}
}

async function fetchConfig(): Promise<Record<string, unknown> | null> {
  try {
    const slug = getSlug();
    const res = await fetch(`${BFF_URL}/api/store/public?_store=${slug}`, {
      headers: { 'X-Tenant-Slug': slug },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function toStoreConfig(raw: Record<string, unknown>): StoreConfig {
  const presets = (raw.components_presets ?? {}) as Record<string, unknown>;
  return {
    components_presets: {
      button:       presets.button       as string | undefined,
      input:        presets.input        as string | undefined,
      select:       presets.select       as string | undefined,
      textarea:     presets.textarea     as string | undefined,
      navbar:       presets.navbar       as string | undefined,
      product_card: presets.product_card as string | undefined,
      view_toggle:  presets.view_toggle  as string | undefined,
    },
    product_detail_layout: raw.product_detail_layout as string | undefined,
    cart_layout:           raw.cart_layout           as string | undefined,
    search_preset:         raw.search_preset         as string | undefined,
  };
}

export function DynamicStoreTheme({
  initialConfig,
  children,
}: {
  initialConfig: Record<string, unknown>;
  children: React.ReactNode;
}) {
  const [config, setConfig] = useState<StoreConfig>(() => toStoreConfig(initialConfig));

  function apply(raw: Record<string, unknown>) {
    if (typeof raw.brand_hue === 'number') applyBrandHue(raw.brand_hue);
    if (typeof raw.font_family === 'string') applyFont(raw.font_family);
    const presets = raw.components_presets as Record<string, unknown> | undefined;
    if (typeof presets?.button === 'string') applyStoreTheme(presets.button);
    setConfig(toStoreConfig(raw));
  }

  useEffect(() => {
    const cached = readSession();
    if (cached) apply(cached);

    fetchConfig().then((fresh) => {
      if (fresh) {
        writeSession(fresh);
        apply(fresh);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StoreConfigContext.Provider value={config}>
      {children}
    </StoreConfigContext.Provider>
  );
}
