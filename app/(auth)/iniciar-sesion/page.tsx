'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { isAxiosError } from 'axios';
import { auth, startSession } from '@/utils/api';
import { Text } from 'zoui';
import { StoreButton } from '@/components/ui/StoreButton';
import { StoreInput } from '@/components/ui/StoreInput';
import { StorePasswordInput } from '@/components/ui/StorePasswordInput';

const ERRORS: Record<string, string> = {
  INVALID_CREDENTIALS: 'Email o contraseña incorrectos.',
  ACCOUNT_LOCKED: 'Cuenta bloqueada temporalmente. Intentá en 15 minutos.',
  RATE_LIMIT_EXCEEDED: 'Demasiados intentos. Esperá unos minutos.',
  INTERNAL_ERROR: 'Error del servidor. Intentá de nuevo.',
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/';
  const registered = searchParams.get('registered') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isValid = emailValid && password.length > 0;

  async function handleSubmit() {
    if (!isValid) return;
    setError('');
    setLoading(true);

    try {
      const { data } = await auth.login(email, password, { _skipModal: true });
      const res = data as { status?: string; mfaToken?: string; accessToken?: string };

      if (res.status === 'MFA_REQUIRED') {
        router.push(`/iniciar-sesion/verificar-mfa?mfaToken=${encodeURIComponent(res.mfaToken!)}&next=${encodeURIComponent(next)}`);
        return;
      }

      if (res.status === 'MFA_SETUP_REQUIRED') {
        setError('Tu cuenta requiere configurar verificación en dos pasos. Accedé desde la plataforma de gestión.');
        return;
      }

      startSession(res.accessToken!);
      router.push(next);
    } catch (err) {
      if (isAxiosError(err)) {
        const code = err.response?.data?.error as string | undefined;
        setError(ERRORS[code ?? ''] ?? ERRORS.INTERNAL_ERROR);
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

      <Text variant="heading-2" className="zoui-auth__title">Iniciar sesión</Text>
      <Text variant="body-sm" color="muted" className="zoui-auth__subtitle">Accedé a tu cuenta.</Text>

      {registered && (
        <div className="zoui-auth__notice">
          <Text variant="body-sm">Cuenta creada. Podés iniciar sesión.</Text>
        </div>
      )}

      <div className="zoui-auth__form">
        <StoreInput id="email" type="email" autoComplete="email" autoFocus label="Email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} data-testid="store-login-email" />
        <StorePasswordInput id="password" autoComplete="current-password" label="Contraseña" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} data-testid="store-login-password" />

        {error && (
          <Text variant="body-sm" className="zoui-auth__error" data-testid="store-login-error">{error}</Text>
        )}

        <StoreButton loading={loading} disabled={!isValid || loading} size="md" fullWidth onClick={handleSubmit} data-testid="store-login-submit">
          {loading ? 'Ingresando...' : 'Ingresar'}
        </StoreButton>
      </div>

      <Text variant="body-sm" color="muted" className="zoui-auth__footer">
        ¿No tenés cuenta?{' '}
        <Link href="/registro" className="zoui-auth__link">
          Registrate
        </Link>
      </Text>
    </div>
  );
}

export default function IniciarSesionPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
