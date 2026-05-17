'use client';

import { Button, Text } from 'zoui';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <Text variant="heading-1" color="muted" style={{ fontSize: '60px', marginBottom: '16px' }}>!</Text>
      <Text variant="heading-2" as="h1" style={{ marginBottom: '12px' }}>Algo salió mal</Text>
      <Text variant="body" color="secondary" style={{ marginBottom: '32px', maxWidth: '360px' }}>
        Ocurrió un error inesperado. Podés intentar de nuevo o volver al inicio.
      </Text>
      <Button variant="filled" shape="rounded" size="md" onClick={reset}>
        Reintentar
      </Button>
    </main>
  );
}
