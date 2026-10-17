'use client';

import { useState } from 'react';
import Link from 'next/link';
import { isAxiosError } from 'axios';
import { Text } from 'zoui';
import { auth } from '@/utils/api';
import { StoreButton } from '@/components/ui/StoreButton';
import { StoreInput } from '@/components/ui/StoreInput';

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function handleSubmit() {
    if (!emailValid || loading) return;
    setError('');
    setLoading(true);
    try {
      await auth.forgotPassword(email.trim(), { _skipModal: true });
      setSent(true);
    } catch (err) {
      setError(isAxiosError(err) && err.response?.status === 429 ? 'Hiciste muchos pedidos seguidos. Probá de nuevo en unos minutos.' : 'No pudimos procesar el pedido. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="zoui-auth__card">
      <Link href="/iniciar-sesion" className="zoui-auth__back">
        <Text variant="body-sm" color="muted">← Volver al inicio de sesión</Text>
      </Link>

      <Text variant="heading-2" className="zoui-auth__title">Recuperar contraseña</Text>
      <Text variant="body-sm" color="muted" className="zoui-auth__subtitle">Ingresá tu email y te enviamos un enlace para elegir una contraseña nueva.</Text>

      {sent ? (
        <div className="zoui-auth__notice" data-testid="store-recover-sent">
          <Text variant="body-sm">Si existe una cuenta con ese email, vas a recibir el enlace en los próximos minutos. Revisá también la carpeta de spam.</Text>
        </div>
      ) : (
        <div className="zoui-auth__form">
          <StoreInput id="email" type="email" autoComplete="email" autoFocus label="Email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} data-testid="store-recover-email" />
          {error && <Text variant="body-sm" className="zoui-auth__error" data-testid="store-recover-error">{error}</Text>}
          <StoreButton loading={loading} disabled={!emailValid || loading} size="md" fullWidth onClick={handleSubmit} data-testid="store-recover-submit">
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </StoreButton>
        </div>
      )}
    </div>
  );
}
