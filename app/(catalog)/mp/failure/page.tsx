'use client';

import { useRouter } from 'next/navigation';
import { Text } from 'zoui';
import { StoreButton } from '@/components/ui/StoreButton';

export default function MpFailurePage() {
  const router = useRouter();
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-subtle)', padding: '16px' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✕</div>
        <Text variant="heading-2" as="h1" style={{ marginBottom: '8px' }}>El pago no fue completado</Text>
        <Text variant="body-sm" color="secondary" as="p" style={{ marginBottom: '24px' }}>
          El pago fue rechazado o cancelado. Podés intentarlo de nuevo o elegir otro medio de pago.
        </Text>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <StoreButton size="md" onClick={() => router.push('/checkout')}>
            Volver al checkout
          </StoreButton>
          <StoreButton variant="ghost" size="md" onClick={() => router.push('/productos')}>
            Ver productos
          </StoreButton>
        </div>
      </div>
    </main>
  );
}
