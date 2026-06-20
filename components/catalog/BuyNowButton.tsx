'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'zoui';
import { useCart } from '@/context/CartContext';

interface BuyNowButtonProps {
  productId: string;
  quantity: number;
  selectedOptions?: Record<string, string>;
  disabled?: boolean;
}

export function BuyNowButton({ productId, quantity, selectedOptions, disabled }: BuyNowButtonProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const result = await addItem({ productId, selectedOptions, quantity });
    setLoading(false);
    if (result.ok) {
      router.push('/checkout');
    }
  }

  return (
    <Button
      size="md"
      fullWidth
      disabled={disabled || loading}
      onClick={handleClick}
      style={{ justifyContent: 'center' }}
    >
      {loading ? 'Agregando…' : 'Comprar ahora'}
    </Button>
  );
}
