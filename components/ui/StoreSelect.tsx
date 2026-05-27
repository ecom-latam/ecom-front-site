'use client';
import { Select } from 'zoui';
import type { ComponentProps } from 'react';
import { useStoreConfig } from '@/context/StoreConfigContext';

type Props = ComponentProps<typeof Select>;

export function StoreSelect({ variant, ...props }: Props) {
  const { components_presets } = useStoreConfig();
  return <Select variant={(variant ?? components_presets?.select ?? 'outlined') as Props['variant']} {...props} />;
}
