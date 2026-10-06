'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Text } from 'zoui';
import { StoreButton } from '@/components/ui/StoreButton';
import { useCart } from '@/context/CartContext';

type Variant = 'success' | 'pending' | 'failure';

const COPY: Record<Variant, { icon: string; title: string; body: string }> = {
  success: {
    icon: '✓',
    title: '¡Pago confirmado!',
    body: 'Tu pago se realizó con éxito. Estamos preparando tu pedido.',
  },
  pending: {
    icon: '⏳',
    title: 'Tu pago está pendiente',
    body: 'Mercado Pago todavía está procesando el pago. Te avisaremos cuando se acredite.',
  },
  failure: {
    icon: '✕',
    title: 'El pago no se completó',
    body: 'No se pudo concretar el pago. Tu carrito sigue guardado para que vuelvas a intentar.',
  },
};

function MpResultInner({ variant }: { variant: Variant }) {
  const router = useRouter();
  const params = useSearchParams();
  const { clearCart } = useCart();
  const orderId = params.get('order');
  const copy = COPY[variant];

  // En éxito o pendiente la orden ya se creó: se vacía el carrito.
  // En fallo se conserva para que el comprador reintente.
  useEffect(() => {
    if (variant === 'success' || variant === 'pending') {
      clearCart().catch((err) => console.error('[MpResult]', err));
    }
  }, [variant, clearCart]);

  return (
    <main className="zoui-mp">
      <div className="zoui-mp__container">
        <div className={`zoui-mp__icon zoui-mp__icon--${variant}`}>{copy.icon}</div>
        <Text variant="heading-2" className="zoui-mp__title" data-testid="mp-result-title">{copy.title}</Text>
        <Text variant="body" color="muted" className="zoui-mp__body">{copy.body}</Text>

        <div className="zoui-mp__actions">
          {orderId && (variant === 'success' || variant === 'pending') && (
            <StoreButton size="md" onClick={() => router.push(`/pedidos/${orderId}`)}>
              Ver pedido
            </StoreButton>
          )}
          {variant === 'failure' && (
            <StoreButton size="md" onClick={() => router.push('/carrito')}>
              Volver al carrito
            </StoreButton>
          )}
          <StoreButton emphasis="outlined" size="md" onClick={() => router.push('/productos')}>
            Seguir comprando
          </StoreButton>
        </div>
      </div>
    </main>
  );
}

export function MpResult({ variant }: { variant: Variant }) {
  return (
    <Suspense fallback={null}>
      <MpResultInner variant={variant} />
    </Suspense>
  );
}
