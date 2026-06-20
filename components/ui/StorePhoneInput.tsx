'use client';
import { PhoneInput } from 'zoui';
import type { ComponentProps } from 'react';

type Props = ComponentProps<typeof PhoneInput>;

export function StorePhoneInput(props: Props) {
  return <PhoneInput {...props} />;
}
