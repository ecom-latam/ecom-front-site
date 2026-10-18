'use client';

import { useRouter } from 'next/navigation';
import { Text } from 'zoui';
import { StoreButton } from '@/components/ui/StoreButton';
import SessionsCard from '@/components/account/SessionsCard';
import TwoStepCard from '@/components/account/TwoStepCard';
import { useAccountStatus } from '@/hooks/useAccountStatus';
import styles from '@/components/account/account.module.scss';

export default function SeguridadPage() {
  const router = useRouter();
  const { status, refresh } = useAccountStatus();

  return (
    <main className="zoui-account">
      <div className="zoui-account__container zoui-account__container--narrow">
        <Text variant="heading-2" className="zoui-account__title">Seguridad</Text>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <section className={styles.card} data-testid="password-card">
            <div className={styles.head}>
              <div>
                <div className={styles.title}>
                  <Text variant="heading-3">Contraseña</Text>
                </div>
                <Text variant="body-sm" color="secondary">Es la misma para tu cuenta de Web Owlet en el panel y en todas las tiendas. Cambiala cada tanto o si creés que alguien la conoce.</Text>
              </div>
              <StoreButton emphasis="outlined" size="sm" onClick={() => router.push('/mi-cuenta/seguridad/contrasena')} data-testid="password-change">Cambiar contraseña</StoreButton>
            </div>
          </section>

          {status && <TwoStepCard enabled={status.mfaEnabled} onChanged={refresh} />}
          <SessionsCard />
        </div>
      </div>
    </main>
  );
}
