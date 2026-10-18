'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { isAxiosError } from 'axios';
import { auth, startSession } from '@/utils/api';
import { Text } from 'zoui';
import { StoreButton } from '@/components/ui/StoreButton';
import { StoreInput } from '@/components/ui/StoreInput';

const ERRORS: Record<string, string> = {
  'MS01-ERR023': 'Código incorrecto. Verificá tu app de autenticación.',
  'MS01-ERR022': 'Ingresá el código de 6 dígitos.',
  'MS01-ERR005': 'Cuenta bloqueada temporalmente. Intentá en 15 minutos.',
  INTERNAL_ERROR: 'Error del servidor. Intentá de nuevo.',
};

function MfaVerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mfaToken = searchParams.get('mfaToken') ?? '';
  const next = searchParams.get('next') ?? '/';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recovery, setRecovery] = useState<'idle' | 'sending' | 'sent'>('idle');

  if (!mfaToken) {
    router.replace('/iniciar-sesion');
    return null;
  }

  async function handleRecover() {
    setError('');
    setRecovery('sending');
    try {
      await auth.mfaRecover(mfaToken, { _skipModal: true });
      setRecovery('sent');
    } catch {
      setRecovery('idle');
      setError('No pudimos enviar el correo. Volvé a iniciar sesión e intentá de nuevo.');
    }
  }

  async function handleSubmit() {
    setError('');
    setLoading(true);

    try {
      const { data } = await auth.mfaVerify(mfaToken, code);
      const accessToken = (data as { accessToken?: string }).accessToken;
      if (accessToken) startSession(accessToken);
      router.push(next);
    } catch (err) {
      if (isAxiosError(err)) {
        const code2: unknown = err.response?.data?.error?.code;
        setError(ERRORS[typeof code2 === 'string' ? code2 : ''] ?? ERRORS.INTERNAL_ERROR);
      } else {
        setError(ERRORS.INTERNAL_ERROR);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="zoui-auth__card">
      <Link href="/iniciar-sesion" className="zoui-auth__back" data-testid="store-mfa-back">
        <Text variant="body-sm" color="muted">← Volver a iniciar sesión</Text>
      </Link>

      <Text variant="heading-2" className="zoui-auth__title">Verificación en dos pasos</Text>
      <Text variant="body-sm" color="secondary" className="zoui-auth__subtitle">
        Ingresá el código de 6 dígitos de tu app de autenticación.
      </Text>

      <div className="zoui-auth__form">
        <StoreInput
          label="Código"
          type="text"
          inputMode="numeric"
          maxLength={6}
          autoComplete="one-time-code"
          autoFocus
          error={error || undefined}
          className="zoui-auth__code"
          fullWidth
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />

        <StoreButton
          disabled={code.length !== 6 || loading}
          size="md"
          fullWidth
          onClick={handleSubmit}
        >
          {loading ? 'Verificando...' : 'Verificar'}
        </StoreButton>

        {recovery === 'sent' ? (
          <Text variant="body-sm" color="muted" data-testid="store-mfa-recover-sent">
            Te enviamos un correo con un enlace para desactivar la verificación en dos pasos y entrar solo con tu contraseña. Vence en 30 minutos. Después te recomendamos volver a activarla desde Mi cuenta.
          </Text>
        ) : (
          <>
            <Text variant="caption" color="muted" style={{ textAlign: 'center' }}>¿No tenés acceso a tu app de autenticación?</Text>
            <StoreButton emphasis="outlined" size="md" fullWidth loading={recovery === 'sending'} disabled={recovery === 'sending'} onClick={handleRecover} data-testid="store-mfa-recover">
              Desactivar por correo
            </StoreButton>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerificarMfaPage() {
  return (
    <Suspense>
      <MfaVerifyForm />
    </Suspense>
  );
}
