'use client';
import { PasswordInput } from 'zoui';
import type { ComponentProps } from 'react';

type Props = ComponentProps<typeof PasswordInput>;

export function StorePasswordInput(props: Props) {
  return <PasswordInput {...props} />;
}
