'use client';
import { Textarea } from 'zoui';
import type { ComponentProps } from 'react';
import { useStoreConfig } from '@/context/StoreConfigContext';

type Props = ComponentProps<typeof Textarea>;

export function StoreTextarea({ variant, ...props }: Props) {
  const { components_presets } = useStoreConfig();
  return <Textarea variant={(variant ?? components_presets?.textarea ?? 'outlined') as Props['variant']} {...props} />;
}
