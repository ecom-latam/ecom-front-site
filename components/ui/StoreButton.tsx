'use client';
import { Button } from 'zoui';
import type { ComponentProps } from 'react';

type Props = ComponentProps<typeof Button>;

export function StoreButton(props: Props) {
  return <Button {...props} />;
}
