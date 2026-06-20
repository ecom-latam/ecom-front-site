'use client';
import { Input } from 'zoui';
import type { ComponentProps } from 'react';

type Props = ComponentProps<typeof Input>;

export function StoreInput(props: Props) {
  return <Input {...props} />;
}
