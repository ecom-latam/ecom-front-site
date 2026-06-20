'use client';
import { Select } from 'zoui';
import type { ComponentProps } from 'react';

type Props = ComponentProps<typeof Select>;

export function StoreSelect(props: Props) {
  return <Select {...props} />;
}
