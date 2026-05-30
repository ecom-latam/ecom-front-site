'use client';
import { NumberInput } from 'zoui';
import type { ComponentProps } from 'react';
import { useStoreConfig } from '@/context/StoreConfigContext';

type Props = ComponentProps<typeof NumberInput>;

export function StoreNumberInput({ variant, ...props }: Props) {
  const { components_presets } = useStoreConfig();
  return <NumberInput variant={(variant ?? components_presets?.input ?? 'outlined') as Props['variant']} {...props} />;
}
