'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Modal, Text } from 'zoui';
import { auth, type AccountSession } from '@/utils/api/auth';
import { formatDateTime } from '@/lib/formatDate';
import styles from './account.module.scss';

const describeDevice = (session: AccountSession) => [session.browser, session.os].filter((part) => part && part !== 'Otro').join(' en ') || 'Dispositivo desconocido';
const describePlace = (session: AccountSession) => [session.city, session.country].filter(Boolean).join(', ') || null;

export default function SessionsCard() {
  const [sessions, setSessions] = useState<AccountSession[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await auth.sessions();
      setSessions(data.data);
      setError('');
    } catch {
      setError('No pudimos leer las sesiones. Intentá de nuevo.');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function close(id: string) {
    setBusy(id);
    try {
      await auth.closeSession(id);
      await load();
    } catch {
      setError('No pudimos cerrar esa sesión. Intentá de nuevo.');
    } finally {
      setBusy(null);
    }
  }

  async function closeOthers() {
    setBusy('others');
    setConfirmAll(false);
    try {
      await auth.closeOtherSessions();
      await load();
    } catch {
      setError('No pudimos cerrar las demás sesiones. Intentá de nuevo.');
    } finally {
      setBusy(null);
    }
  }

  const others = (sessions ?? []).filter((session) => !session.current);

  return (
    <section className={styles.card} data-testid="sessions-card">
      <div className={styles.head}>
        <div>
          <Text variant="heading-3">Sesiones abiertas</Text>
          <Text variant="body-sm" color="secondary">Dispositivos donde tu cuenta tiene la sesión iniciada. Si ves alguno que no reconocés, cerralo y cambiá tu contraseña.</Text>
        </div>
        {others.length > 0 && (
          <Button emphasis="outlined" size="sm" disabled={busy !== null} onClick={() => setConfirmAll(true)} data-testid="sessions-close-others">Cerrar las demás</Button>
        )}
      </div>

      {error && <Text variant="body-sm" color="danger" data-testid="sessions-error">{error}</Text>}
      {sessions === null && !error && <Text variant="body-sm" color="muted">Cargando…</Text>}

      <div className={styles.list}>
        {[...(sessions ?? [])].sort((a, b) => Number(b.current) - Number(a.current)).map((session) => (
          <div key={session.id} className={styles.row} data-testid={`session-${session.current ? 'current' : 'other'}`}>
            <div className={styles.who}>
              <div className={styles.title}>
                <Text variant="body" weight="medium">{describeDevice(session)}</Text>
                {session.current && <Badge tone="success" size="sm">Esta sesión</Badge>}
              </div>
              <Text variant="body-sm" color="muted">
                {[session.device, describePlace(session), session.ip].filter(Boolean).join(' · ')}
              </Text>
              <Text variant="body-sm" color="muted">
                {session.lastUsedAt ? `Última actividad: ${formatDateTime(session.lastUsedAt)}` : 'Sin actividad registrada'}
                {session.startedAt ? ` · Inició: ${formatDateTime(session.startedAt)}` : ''}
              </Text>
            </div>
            {!session.current && (
              <Button emphasis="ghost" size="sm" loading={busy === session.id} disabled={busy !== null} onClick={() => close(session.id)} data-testid="session-close">Cerrar</Button>
            )}
          </div>
        ))}
      </div>

      {sessions && sessions.length === 0 && <Text variant="body-sm" color="muted">No hay sesiones registradas.</Text>}
      <Text variant="caption" color="muted">Al cerrar una sesión, ese dispositivo pierde el acceso enseguida: en su próxima acción se le pide volver a ingresar.</Text>

      {confirmAll && (
        <Modal open size="sm" onClose={() => setConfirmAll(false)}>
          <Modal.Header>Cerrar las demás sesiones</Modal.Header>
          <Modal.Body>
            <Text variant="body-sm" color="secondary">Vas a cerrar {others.length === 1 ? 'la otra sesión abierta' : `las otras ${others.length} sesiones abiertas`}. Esta sesión sigue abierta.</Text>
          </Modal.Body>
          <Modal.Footer>
            <Button emphasis="filled" size="md" onClick={closeOthers} data-testid="sessions-confirm-others">Cerrar las demás</Button>
            <Button emphasis="outlined" size="md" onClick={() => setConfirmAll(false)}>Cancelar</Button>
          </Modal.Footer>
        </Modal>
      )}
    </section>
  );
}
