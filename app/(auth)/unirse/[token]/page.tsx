'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Text } from 'zoui';
import { isAxiosError } from 'axios';
import { auth } from '@/utils/api';
import { StoreButton } from '@/components/ui/StoreButton';
import { StoreInput } from '@/components/ui/StoreInput';
import { StorePasswordInput } from '@/components/ui/StorePasswordInput';

const ROLE_LABELS: Record<string, string> = {
  Manager: 'Manager',
  Seller: 'Vendedor',
};

const ACCEPT_ERRORS: Record<string, string> = {
  'MS01-ERR004': 'La contraseña no coincide con tu cuenta existente.',
  'MS01-ERR010': 'Email inválido.',
  'MS01-ERR011': 'La contraseña debe tener al menos 8 caracteres.',
  'MS01-ERR012': 'Ese email ya tiene una cuenta. Ingresá tu contraseña.',
  'MS01-ERR050': 'El link de invitación expiró. Pedí uno nuevo al administrador.',
  'MS01-ERR051': 'El link de invitación es inválido.',
  'MS01-ERR052': 'Tu cuenta fue creada con un proveedor externo. Contactá al administrador.',
  INTERNAL_ERROR: 'Error del servidor. Intentá de nuevo.',
};

type Phase = 'loading' | 'form' | 'expired' | 'invalid' | 'done';

function UnirseContent() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [phase, setPhase] = useState<Phase>('loading');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const formValid = emailValid && password.length >= 8;

  useEffect(() => {
    auth.getInvitation(token, { _skipModal: true })
      .then(({ data }) => {
        setRole(data.role);
        setPhase('form');
      })
      .catch((err) => {
        if (isAxiosError(err)) {
          const code = err.response?.data?.error?.code;
          if (code === 'MS01-ERR050') { setPhase('expired'); return; }
        }
        setPhase('invalid');
      });
  }, [token]);

  async function handleSubmit() {
    setError('');
    setSubmitting(true);
    try {
      await auth.acceptInvitation(token, { email, password }, { _skipModal: true });
      setPhase('done');
    } catch (err) {
      if (isAxiosError(err)) {
        const code = err.response?.data?.error?.code;
        setError(ACCEPT_ERRORS[code ?? ''] ?? ACCEPT_ERRORS.INTERNAL_ERROR);
      } else {
        setError(ACCEPT_ERRORS.INTERNAL_ERROR);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '384px',
    background: 'var(--color-bg-surface)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border-default)',
    padding: '40px 32px',
  };

  if (phase === 'loading') {
    return (
      <Text variant="body-sm" color="muted">Verificando invitación...</Text>
    );
  }

  if (phase === 'expired') {
    return (
      <div style={{ ...cardStyle, textAlign: 'center' }}>
        <Text tag="p" variant="heading-1" style={{ marginBottom: '16px' }}>⏱</Text>
        <Text variant="heading-3" style={{ marginBottom: '8px' }}>Link expirado</Text>
        <Text variant="body-sm" color="secondary">El link de invitación venció. Pedile uno nuevo al administrador de la tienda.</Text>
      </div>
    );
  }

  if (phase === 'invalid') {
    return (
      <div style={{ ...cardStyle, textAlign: 'center' }}>
        <Text tag="p" variant="heading-1" style={{ marginBottom: '16px' }}>✗</Text>
        <Text variant="heading-3" style={{ marginBottom: '8px' }}>Link inválido</Text>
        <Text variant="body-sm" color="secondary">El link de invitación no es válido.</Text>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div style={{ ...cardStyle, textAlign: 'center' }}>
        <Text variant="heading-3" style={{ marginBottom: '12px' }}>¡Te uniste al equipo!</Text>
        <Text variant="body-sm" color="secondary" style={{ marginBottom: '24px' }}>
          Tu rol es <strong>{ROLE_LABELS[role] ?? role}</strong>. Iniciá sesión con tu email y contraseña.
        </Text>
        <StoreButton
          emphasis="filled"
          size="md"
          style={{ width: '100%' }}
          onClick={() => router.push('/iniciar-sesion')}
          data-testid="invite-go-to-login"
        >
          Iniciar sesión
        </StoreButton>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <Text variant="heading-2" style={{ marginBottom: '8px' }}>Unirte al equipo</Text>
      <Text variant="body-sm" color="secondary" style={{ marginBottom: '24px' }}>
        Fuiste invitado como <strong>{ROLE_LABELS[role] ?? role}</strong>.
        {' '}Ingresá tu email y contraseña para aceptar.
      </Text>
      <div style={{
        background: 'var(--color-bg-subtle)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-md)',
        padding: '8px 12px',
        marginBottom: '24px',
      }}>
        <Text variant="caption" color="muted">
          Si ya tenés una cuenta, usá tu email y contraseña habituales. Si no, se creará una nueva cuenta con los datos que ingreses.
        </Text>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <StoreInput
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          fullWidth
          data-testid="invite-email"
        />
        <StorePasswordInput
          label="Contraseña"
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          fullWidth
          data-testid="invite-password"
        />

        {error && (
          <Text variant="body-sm" style={{ color: 'var(--color-error-500)' }} data-testid="invite-error">
            {error}
          </Text>
        )}

        <StoreButton
          emphasis="filled"
          size="md"
          loading={submitting}
          disabled={!formValid || submitting}
          style={{ width: '100%' }}
          onClick={handleSubmit}
          data-testid="invite-submit"
        >
          Aceptar invitación
        </StoreButton>
      </div>
    </div>
  );
}

export default function UnirsePage() {
  return (
    <Suspense>
      <UnirseContent />
    </Suspense>
  );
}
