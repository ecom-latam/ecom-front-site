'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isAxiosError } from 'axios';
import { auth, startSession } from '@/utils/api';
import { Text } from 'zoui';
import { StoreButton } from '@/components/ui/StoreButton';
import { StoreInput } from '@/components/ui/StoreInput';

const ERRORS: Record<string, string> = {
  INVALID_TOTP: 'Código incorrecto. Verificá tu app de autenticación.',
  MISSING_CODE: 'Ingresá el código de 6 dígitos.',
  RATE_LIMIT_EXCEEDED: 'Demasiados intentos. Esperá unos minutos.',
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

  if (!mfaToken) {
    router.replace('/iniciar-sesion');
    return null;
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
        const code2 = err.response?.data?.error as string | undefined;
        setError(ERRORS[code2 ?? ''] ?? ERRORS.INTERNAL_ERROR);
      } else {
        setError(ERRORS.INTERNAL_ERROR);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="zoui-auth__card">
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
