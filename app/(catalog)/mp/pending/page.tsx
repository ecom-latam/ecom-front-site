'use client';

import { useRouter } from 'next/navigation';
import { Text } from 'zoui';
import { StoreButton } from '@/components/ui/StoreButton';

export default function MpPendingPage() {
  const router = useRouter();
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-subtle)', padding: '16px' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</div>
        <Text variant="heading-2" as="h1" style={{ marginBottom: '8px' }}>Pago en revisión</Text>
        <Text variant="body-sm" color="secondary" as="p" style={{ marginBottom: '24px' }}>
          Tu pago está siendo procesado por MercadoPago. Una vez confirmado, crearemos tu pedido automáticamente. Podés revisar el estado en tus pedidos.
        </Text>
        <StoreButton size="md" onClick={() => router.push('/mis-pedidos')}>
          Ver mis pedidos
        </StoreButton>
      </div>
    </main>
  );
}
