'use client';

import { useStoreConfig } from '@/context/StoreConfigContext';
import { formatPrice } from '@/lib/format';

/** Muestra un precio con la moneda de la tienda y 2 decimales. Útil en árboles server-rendered. */
export function Price({ value }: { value: number }) {
  const { currency } = useStoreConfig();
  return <>{formatPrice(value, currency)}</>;
}
