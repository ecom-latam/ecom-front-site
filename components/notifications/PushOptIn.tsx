'use client';

import { Button, Text } from 'zoui';
import { usePushDevice } from '@/hooks/usePushDevice';
import styles from './notifications.module.scss';

// Invitación a recibir los avisos como notificación del navegador. Solo se muestra si tiene sentido; el permiso se pide con un clic.
export default function PushOptIn() {
  const { state, busy, error, enable } = usePushDevice();

  if (state === 'loading' || state === 'unsupported' || state === 'unavailable' || state === 'on') return null;

  if (state === 'denied') {
    return (
      <div className={styles.optin} data-testid="push-denied">
        <Text variant="body-sm" color="secondary">Bloqueaste las notificaciones de este sitio en el navegador. Si querés recibirlas, habilitalas desde el candado de la barra de direcciones.</Text>
      </div>
    );
  }

  return (
    <div className={styles.optin} data-testid="push-optin">
      <Text variant="body-sm">Recibí los avisos como notificación del navegador, aunque no tengas esta página abierta.</Text>
      {error && <Text variant="body-sm" color="danger" data-testid="push-optin-error">{error}</Text>}
      <Button emphasis="filled" size="sm" loading={busy} disabled={busy} onClick={enable} data-testid="push-enable">Activar notificaciones</Button>
    </div>
  );
}
