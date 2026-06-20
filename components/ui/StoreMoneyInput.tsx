'use client';
import { MoneyInput } from 'zoui';
import type { ComponentProps } from 'react';
import { useStoreConfig } from '@/context/StoreConfigContext';

type Props = ComponentProps<typeof MoneyInput>;

export function StoreMoneyInput({ currency, ...props }: Props) {
  const { currency: storeCurrency } = useStoreConfig();
  return (
    <MoneyInput
      currency={currency ?? storeCurrency ?? 'ARS'}
      {...props}
    />
  );
}
