'use client';
import { Button } from 'zoui';
import type { ComponentProps } from 'react';
import { useStoreConfig } from '@/context/StoreConfigContext';

type Props = ComponentProps<typeof Button>;

export function StoreButton({ variant, ...props }: Props) {
  const { components_presets } = useStoreConfig();
  return <Button variant={(variant ?? components_presets?.button ?? 'primary') as Props['variant']} {...props} />;
}
