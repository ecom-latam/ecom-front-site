'use client';

import { useRouter } from 'next/navigation';
import { Button } from 'zoui';
import type { ButtonVariant } from 'zoui';
import { useStoreConfig } from '@/context/StoreConfigContext';

interface BuyNowButtonProps {
  productId: string;
  quantity: number;
  disabled?: boolean;
}

export function BuyNowButton({ productId, quantity, disabled }: BuyNowButtonProps) {
  const router = useRouter();
  const { components_presets } = useStoreConfig();
  const btnVariant = (components_presets?.button ?? 'secondary') as ButtonVariant;

  return (
    <Button
      variant={btnVariant}
      size="md"
      fullWidth
      disabled={disabled}
      onClick={() => router.push(`/checkout?buyNow=${productId}&qty=${quantity}`)}
      style={{ justifyContent: 'center' }}
    >
      Comprar ahora
    </Button>
  );
}
