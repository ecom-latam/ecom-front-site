'use client';

import { Button, Icon, Text, Tooltip } from 'zoui';
import { usePushDevice } from '@/hooks/usePushDevice';
import styles from './notifications.module.scss';

// Invitación a recibir los avisos como notificación del navegador. Solo se muestra si tiene sentido; el permiso se pide con un clic.
export default function PushOptIn() {
  const { state, busy, error, enable } = usePushDevice();

  if (state === 'loading' || state === 'unsupported' || state === 'unavailable' || state === 'on') return null;

  if (state === 'denied') {
    return (
      <div className={styles.optinRow} data-testid="push-denied">
        <span className={styles.optinLabel}>
          <Text variant="body-sm" color="secondary">Notificaciones push bloqueadas</Text>
          <Tooltip side="bottom" content={<span className={styles.tip}>Bloqueaste las notificaciones de este sitio en el navegador. Para recibirlas, habilitalas desde el candado de la barra de direcciones.</span>}>
            <span className={styles.help} tabIndex={0} aria-label="Cómo habilitarlas" data-testid="push-denied-help"><Icon name="info" size="sm" /></span>
          </Tooltip>
        </span>
      </div>
    );
  }

  return (
    <div className={styles.optinRow} data-testid="push-optin">
      <span className={styles.optinLabel}>
        <Text variant="label">Notificaciones push</Text>
        <Tooltip side="bottom" content={<span className={styles.tip}>Te llega un aviso a la pantalla de tu computadora cuando entra un pedido, aunque estés en otra pestaña o en otra aplicación. Los avisos también quedan guardados acá.</span>}>
          <span className={styles.help} tabIndex={0} aria-label="Qué son las notificaciones push" data-testid="push-optin-help"><Icon name="info" size="sm" /></span>
        </Tooltip>
      </span>
      <Button emphasis="outlined" size="sm" loading={busy} disabled={busy} onClick={enable} data-testid="push-enable">Activar</Button>
      {error && <Text variant="body-sm" color="danger" data-testid="push-optin-error">{error}</Text>}
    </div>
  );
}
