'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Text } from 'zoui';
import { StoreButton } from '@/components/ui/StoreButton';

function MpSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id') ?? '';

  useEffect(() => {
    if (paymentId) {
      // EC-392 will handle order creation here
    }
  }, [paymentId]);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-subtle)', padding: '16px' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✓</div>
        <Text variant="heading-2" as="h1" style={{ marginBottom: '8px' }}>¡Pago recibido!</Text>
        <Text variant="body-sm" color="secondary" as="p" style={{ marginBottom: '24px' }}>
          Tu pago fue procesado por MercadoPago. En breve recibirás la confirmación de tu pedido.
        </Text>
        <StoreButton size="md" onClick={() => router.push('/mis-pedidos')}>
          Ver mis pedidos
        </StoreButton>
      </div>
    </main>
  );
}

export default function MpSuccessPage() {
  return <Suspense><MpSuccessContent /></Suspense>;
}
