'use client';
import { Textarea } from 'zoui';
import type { ComponentProps } from 'react';

type Props = ComponentProps<typeof Textarea>;

export function StoreTextarea(props: Props) {
  return <Textarea {...props} />;
}
