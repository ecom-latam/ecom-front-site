'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { isAxiosError } from 'axios';
import { Text } from 'zoui';
import { auth } from '@/utils/api';
import { StoreButton } from '@/components/ui/StoreButton';
import { StorePasswordInput } from '@/components/ui/StorePasswordInput';

const MIN = 8;
const MAX = 72;

function ResetForm() {
  const token = useSearchParams().get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invalidLink, setInvalidLink] = useState(token.length === 0);
  const [done, setDone] = useState(false);

  const matches = password === confirm;
  const valid = password.length >= MIN && password.length <= MAX && matches;

  async function handleSubmit() {
    if (!valid || loading) return;
    setError('');
    setLoading(true);
    try {
      await auth.resetPassword(token, password, { _skipModal: true });
      setDone(true);
    } catch (err) {
      const raw = isAxiosError(err) ? err.response?.data?.error : undefined;
      const code = typeof raw === 'string' ? raw : raw?.code;
      if (code === 'MS01-ERR060') setInvalidLink(true);
      else if (code === 'MS01-ERR014' || code === 'MS01-ERR015') setError(`La contraseña debe tener entre ${MIN} y ${MAX} caracteres.`);
      else setError('No pudimos cambiar la contraseña. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="zoui-auth__card">
        <Text variant="heading-2" className="zoui-auth__title">Contraseña cambiada</Text>
        <div className="zoui-auth__notice" data-testid="store-reset-done">
          <Text variant="body-sm">Listo, ya podés ingresar con tu contraseña nueva. Por seguridad cerramos las sesiones que tenías abiertas.</Text>
        </div>
        <Link href="/iniciar-sesion" className="zoui-auth__link" data-testid="store-reset-login"><Text variant="body-sm">Iniciar sesión</Text></Link>
      </div>
    );
  }

  if (invalidLink) {
    return (
      <div className="zoui-auth__card">
        <Text variant="heading-2" className="zoui-auth__title">El enlace ya no sirve</Text>
        <div className="zoui-auth__error" data-testid="store-reset-invalid">
          <Text variant="body-sm">El enlace venció, ya se usó o no es correcto. Pedí uno nuevo y usalo dentro de los 30 minutos.</Text>
        </div>
        <Link href="/recuperar-contrasena" className="zoui-auth__link"><Text variant="body-sm">Pedir un enlace nuevo</Text></Link>
      </div>
    );
  }

  return (
    <div className="zoui-auth__card">
      <Text variant="heading-2" className="zoui-auth__title">Elegí tu contraseña nueva</Text>
      <Text variant="body-sm" color="muted" className="zoui-auth__subtitle">Entre {MIN} y {MAX} caracteres.</Text>
      <div className="zoui-auth__form">
        <StorePasswordInput id="password" autoComplete="new-password" autoFocus label="Contraseña nueva" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} data-testid="store-reset-password" />
        <StorePasswordInput id="confirm" autoComplete="new-password" label="Repetí la contraseña" fullWidth value={confirm} onChange={(e) => setConfirm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} data-testid="store-reset-confirm" />
        {confirm.length > 0 && !matches && <Text variant="body-sm" className="zoui-auth__error" data-testid="store-reset-mismatch">Las contraseñas no coinciden.</Text>}
        {error && <Text variant="body-sm" className="zoui-auth__error" data-testid="store-reset-error">{error}</Text>}
        <StoreButton loading={loading} disabled={!valid || loading} size="md" fullWidth onClick={handleSubmit} data-testid="store-reset-submit">
          {loading ? 'Guardando...' : 'Cambiar contraseña'}
        </StoreButton>
      </div>
    </div>
  );
}

export default function RestablecerContrasenaPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
