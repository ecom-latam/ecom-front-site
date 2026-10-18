'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAxiosError } from 'axios';
import { auth, startSession } from '@/utils/api';
import { trackBuyerRegistered } from '@/lib/analytics';
import { DisabledOverlay, Text } from 'zoui';
import { useCustomerRegistrationOpen } from '@/hooks/useCustomerRegistrationOpen';
import { StoreButton } from '@/components/ui/StoreButton';
import { StoreInput } from '@/components/ui/StoreInput';
import { StorePasswordInput } from '@/components/ui/StorePasswordInput';

const EMAIL_TAKEN = 'MS01-ERR012';

const ERRORS: Record<string, string> = {
  'MS01-ERR010': 'El email no es válido.',
  'MS01-ERR011': 'La contraseña debe tener al menos 8 caracteres.',
  'MS01-ERR040': 'No se pudo identificar el sitio.',
  'MS01-ERR055': 'Por ahora no se pueden crear cuentas nuevas.',
  INTERNAL_ERROR: 'Error del servidor. Intentá de nuevo.',
};

export default function RegistroPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailTaken, setEmailTaken] = useState(false);
  const [loading, setLoading] = useState(false);
  const registrationOpen = useCustomerRegistrationOpen();

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isValid = emailValid && password.length >= 8;

  async function handleSubmit() {
    if (!isValid) return;
    setError('');
    setEmailTaken(false);
    setLoading(true);

    try {
      await auth.registerCustomer(email, password, { _skipModal: true });
      trackBuyerRegistered();
      const { data } = await auth.login(email, password, { _skipModal: true });
      const res = data as { accessToken?: string };
      if (res.accessToken) startSession(res.accessToken);
      router.push('/');
    } catch (err) {
      if (isAxiosError(err)) {
        const code: unknown = err.response?.data?.error?.code;
        if (code === EMAIL_TAKEN) setEmailTaken(true);
        else setError(ERRORS[typeof code === 'string' ? code : ''] ?? ERRORS.INTERNAL_ERROR);
      } else {
        setError(ERRORS.INTERNAL_ERROR);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="zoui-auth__card">
      <Link href="/productos" className="zoui-auth__back">
        <Text variant="body-sm" color="muted">← Volver al sitio</Text>
      </Link>

      <Text variant="heading-2" className="zoui-auth__title">Crear cuenta</Text>
      <Text variant="body-sm" color="muted" className="zoui-auth__subtitle">Con una sola cuenta de Web Owlet comprás en cualquier tienda. Si ya tenés una, iniciá sesión con ella.</Text>

      <DisabledOverlay fill disabled={registrationOpen === false} label="Registro deshabilitado" hint="Por ahora no se pueden crear cuentas nuevas">
      <div className="zoui-auth__form">
        <StoreInput id="email" type="email" autoComplete="email" autoFocus label="Email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} data-testid="store-register-email" />
        <StorePasswordInput
          id="password"
          autoComplete="new-password"
          label="Contraseña"
          hint="Mínimo 8 caracteres"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          data-testid="store-register-password"
        />

        {error && (
          <Text variant="body-sm" className="zoui-auth__error" data-testid="store-register-error">{error}</Text>
        )}

        {emailTaken && (
          <div className="zoui-auth__notice" data-testid="store-register-taken">
            <Text variant="body-sm">Ese email ya tiene una cuenta de Web Owlet, y sirve en todas las tiendas. Iniciá sesión con tu contraseña de siempre.</Text>
            <Link href={`/iniciar-sesion?email=${encodeURIComponent(email.trim())}`} className="zoui-auth__link" data-testid="store-register-taken-login">
              <Text variant="body-sm">Iniciar sesión con este email</Text>
            </Link>
          </div>
        )}

        <StoreButton loading={loading} disabled={!isValid || loading} size="md" fullWidth onClick={handleSubmit} data-testid="store-register-submit">
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </StoreButton>
      </div>
      </DisabledOverlay>

      <Text variant="body-sm" color="muted" className="zoui-auth__footer">
        ¿Ya tenés cuenta?{' '}
        <Link href="/iniciar-sesion" className="zoui-auth__link">
          Iniciá sesión
        </Link>
      </Text>
    </div>
  );
}
