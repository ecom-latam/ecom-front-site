'use client';

import { useState } from 'react';
import QRCode from 'qrcode';
import { isAxiosError } from 'axios';
import { Badge, Button, Input, Text } from 'zoui';
import { auth } from '@/utils/api/auth';
import styles from './account.module.scss';

const ERRORS: Record<string, string> = {
  'MS01-ERR023': 'Código incorrecto. Verificá tu app de autenticación.',
  'MS01-ERR022': 'Ingresá el código de 6 dígitos.',
  'MS01-ERR020': 'La verificación en dos pasos ya está activa.',
};

interface Props {
  enabled: boolean;
  onChanged: () => void;
}

export default function TwoStepCard({ enabled, onChanged }: Props) {
  const [phase, setPhase] = useState<'idle' | 'scan'>('idle');
  const [qr, setQr] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [justEnabled, setJustEnabled] = useState(false);
  const [disableMail, setDisableMail] = useState<'idle' | 'sending' | 'sent'>('idle');

  async function start() {
    setBusy(true);
    setError('');
    try {
      const { data } = await auth.mfaEnroll();
      setQr(await QRCode.toDataURL(data.otpauth_url, { width: 200 }));
      setSecret(data.secret);
      setPhase('scan');
    } catch (err) {
      const errCode = isAxiosError(err) ? err.response?.data?.error?.code : undefined;
      setError(ERRORS[errCode ?? ''] ?? 'No pudimos empezar la activación. Intentá de nuevo.');
    } finally {
      setBusy(false);
    }
  }

  async function requestDisable() {
    setDisableMail('sending');
    setError('');
    try {
      await auth.mfaDisableRequest({ _skipModal: true });
      setDisableMail('sent');
    } catch {
      setDisableMail('idle');
      setError('No pudimos enviar el correo. Intentá de nuevo.');
    }
  }

  async function confirm() {
    if (!code.trim()) {
      setError(ERRORS['MS01-ERR022']);
      return;
    }
    setBusy(true);
    setError('');
    try {
      await auth.mfaEnrollConfirm(code.trim());
      setPhase('idle');
      setJustEnabled(true);
      setCode('');
      onChanged();
    } catch (err) {
      const errCode = isAxiosError(err) ? err.response?.data?.error?.code : undefined;
      setError(ERRORS[errCode ?? ''] ?? 'No pudimos confirmar el código. Intentá de nuevo.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={styles.card} data-testid="two-step-card">
      <div className={styles.head}>
        <div>
          <div className={styles.title}>
            <Text variant="heading-3">Verificación en dos pasos</Text>
            <Badge tone={enabled ? 'success' : 'warning'} size="sm" data-testid="two-step-status">{enabled ? 'Activada' : 'Desactivada'}</Badge>
          </div>
          <Text variant="body-sm" color="secondary">Además de tu contraseña, al ingresar te pedimos un código de tu app de autenticación (Google Authenticator, Authy, etc.). Vale para toda tu cuenta de Web Owlet (el panel y todas las tiendas) y la protege aunque alguien conozca tu contraseña.</Text>
        </div>
        {!enabled && phase === 'idle' && (
          <Button emphasis="filled" size="sm" loading={busy} disabled={busy} onClick={start} data-testid="two-step-start">Activar</Button>
        )}
        {enabled && disableMail !== 'sent' && (
          <Button emphasis="outlined" size="sm" loading={disableMail === 'sending'} disabled={disableMail === 'sending'} onClick={requestDisable} data-testid="two-step-disable">Desactivar</Button>
        )}
      </div>

      {enabled && disableMail === 'sent' && (
        <Text variant="body-sm" color="primary" data-testid="two-step-disable-sent">Te enviamos un correo para confirmar la desactivación. Abrí el enlace y confirmá; vence en 30 minutos. Si no lo pediste vos, ignoralo: la verificación sigue activa.</Text>
      )}

      {justEnabled && enabled && (
        <Text variant="body-sm" color="primary" data-testid="two-step-done">Listo: desde ahora vas a necesitar el código de tu app cada vez que ingreses.</Text>
      )}

      {phase === 'scan' && (
        <div className={styles.qr}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="Código QR para tu app de autenticación" width={200} height={200} data-testid="two-step-qr" />
          <details>
            <summary><Text tag="span" variant="caption" color="muted">¿No podés escanear? Ingresá el código a mano</Text></summary>
            <p className={styles.secret} data-testid="two-step-secret">{secret}</p>
          </details>
          <div className={styles.steps}>
            <Input label="Código de 6 dígitos" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} onKeyDown={(e) => e.key === 'Enter' && confirm()} fullWidth data-testid="two-step-code" />
            {error && <Text variant="body-sm" color="danger" data-testid="two-step-error">{error}</Text>}
            <Button emphasis="filled" size="md" loading={busy} disabled={busy || code.length < 6} onClick={confirm} data-testid="two-step-confirm">Confirmar y activar</Button>
          </div>
        </div>
      )}
      {phase === 'idle' && error && <Text variant="body-sm" color="danger" data-testid="two-step-error">{error}</Text>}
    </section>
  );
}
