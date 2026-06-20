'use client';
import { NumberInput } from 'zoui';
import type { ComponentProps } from 'react';

type Props = ComponentProps<typeof NumberInput>;

export function StoreNumberInput(props: Props) {
  return <NumberInput {...props} />;
}
