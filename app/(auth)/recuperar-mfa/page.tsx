'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Text } from 'zoui';
import { auth } from '@/utils/api';
import { StoreButton } from '@/components/ui/StoreButton';

type Status = 'ask' | 'working' | 'ok' | 'invalid';

function RecoverMfa() {
  const router = useRouter();
  const token = useSearchParams().get('token') ?? '';
  const [status, setStatus] = useState<Status>(token ? 'ask' : 'invalid');

  function confirm() {
    setStatus('working');
    auth.mfaRecoverConfirm(token, { _skipModal: true }).then(() => setStatus('ok')).catch(() => setStatus('invalid'));
  }

  if (status === 'ask' || status === 'working') {
    return (
      <div className="zoui-auth__card">
        <Text variant="heading-2" className="zoui-auth__title">Desactivar la verificación en dos pasos</Text>
        <div className="zoui-auth__notice" data-testid="store-mfa-recover-ask">
          <Text variant="body-sm">Vas a desactivar la verificación en dos pasos de tu cuenta y vamos a cerrar todas tus sesiones. Después podrás iniciar sesión solo con tu contraseña. Te recomendamos volver a activarla desde Mi cuenta apenas entres.</Text>
        </div>
        <div className="zoui-auth__form">
          <StoreButton size="md" fullWidth loading={status === 'working'} disabled={status === 'working'} onClick={confirm} data-testid="store-mfa-recover-confirm">Desactivar</StoreButton>
          <StoreButton emphasis="outlined" size="md" fullWidth onClick={() => router.push('/iniciar-sesion')}>Cancelar</StoreButton>
        </div>
      </div>
    );
  }

  if (status === 'ok') {
    return (
      <div className="zoui-auth__card">
        <Text variant="heading-2" className="zoui-auth__title">Verificación desactivada</Text>
        <div className="zoui-auth__notice" data-testid="store-mfa-recover-ok">
          <Text variant="body-sm">Ya podés iniciar sesión solo con tu contraseña. Te recomendamos volver a activarla desde Mi cuenta apenas entres.</Text>
        </div>
        <Link href="/iniciar-sesion" className="zoui-auth__link"><Text variant="body-sm">Iniciar sesión</Text></Link>
      </div>
    );
  }

  return (
    <div className="zoui-auth__card">
      <Text variant="heading-2" className="zoui-auth__title">El enlace ya no sirve</Text>
      <div className="zoui-auth__error" data-testid="store-mfa-recover-invalid">
        <Text variant="body-sm">El enlace venció, ya se usó o no es correcto. Iniciá sesión de nuevo y pedí otro desde la pantalla del código.</Text>
      </div>
      <Link href="/iniciar-sesion" className="zoui-auth__link"><Text variant="body-sm">Iniciar sesión</Text></Link>
    </div>
  );
}

export default function RecuperarMfaPage() {
  return (
    <Suspense fallback={null}>
      <RecoverMfa />
    </Suspense>
  );
}
