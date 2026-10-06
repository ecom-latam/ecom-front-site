'use client';

import { useState } from 'react';
import { Text } from 'zoui';
import { StoreButton } from '@/components/ui/StoreButton';
import { StorePasswordInput } from '@/components/ui/StorePasswordInput';
import { security } from '@/utils/api/security';

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

const EMPTY = { current: '', next: '', confirm: '' };

export default function SeguridadPage() {
  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<keyof typeof EMPTY, boolean>>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  function set(field: keyof typeof EMPTY, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
    setApiError(null);
  }

  function touch(field: keyof typeof EMPTY) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function validate() {
    const e: Partial<Record<keyof typeof EMPTY, string>> = {};
    if (!form.current) e.current = 'Requerido.';
    if (!form.next) e.next = 'Requerido.';
    else if (form.next.length < 8) e.next = 'Mínimo 8 caracteres.';
    else if (form.next === form.current) e.next = 'La nueva contraseña debe ser diferente a la actual.';
    if (!form.confirm) e.confirm = 'Requerido.';
    else if (form.confirm !== form.next) e.confirm = 'Las contraseñas no coinciden.';
    return e;
  }

  const errors = validate();
  const isValid = Object.keys(errors).length === 0;

  async function handleSave() {
    setTouched({ current: true, next: true, confirm: true });
    if (!isValid) return;

    setSaving(true);
    setApiError(null);
    try {
      await security.changePassword(form.current, form.next);
      setSuccess(true);
      setForm(EMPTY);
      setTouched({});
    } catch (err: unknown) {
      const code = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      if (code === 'INVALID_CURRENT_PASSWORD') setApiError('La contraseña actual es incorrecta.');
      else if (code === 'PASSWORD_TOO_SHORT') setApiError('La nueva contraseña debe tener al menos 8 caracteres.');
      else setApiError('Ocurrió un error. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="zoui-account">
      <div className="zoui-account__container zoui-account__container--narrow">
      <Text variant="heading-2" className="zoui-account__title">Seguridad</Text>

      {/* ── Cambiar contraseña ── */}
      <section className="zoui-account__card zoui-account__card--roomy zoui-account__card--spaced">
        <div className="zoui-account__section-head">
          <ShieldIcon />
          <Text variant="heading-3" className="zoui-account__card-title">Cambiar contraseña</Text>
        </div>

        <div className="zoui-account__fields">
          <StorePasswordInput
            label="Contraseña actual"
            value={form.current}
            onChange={(e) => set('current', e.target.value)}
            onBlur={() => touch('current')}
            error={touched.current ? errors.current : undefined}
            size="md"
            autoComplete="current-password"
          />
          <StorePasswordInput
            label="Nueva contraseña"
            value={form.next}
            onChange={(e) => set('next', e.target.value)}
            onBlur={() => touch('next')}
            error={touched.next ? errors.next : undefined}
            hint={!touched.next || !errors.next ? 'Mínimo 8 caracteres.' : undefined}
            size="md"
            autoComplete="new-password"
          />
          <StorePasswordInput
            label="Confirmar nueva contraseña"
            value={form.confirm}
            onChange={(e) => set('confirm', e.target.value)}
            onBlur={() => touch('confirm')}
            error={touched.confirm ? errors.confirm : undefined}
            size="md"
            autoComplete="new-password"
          />
        </div>

        {apiError && (
          <div className="zoui-account__alert zoui-account__alert--error zoui-account__alert--inline">
            <Text variant="body-sm">{apiError}</Text>
          </div>
        )}

        {success && (
          <div className="zoui-account__alert zoui-account__alert--success zoui-account__alert--inline">
            <Text variant="body-sm">Contraseña actualizada correctamente.</Text>
          </div>
        )}

        <div className="zoui-account__submit">
          <StoreButton
            size="md"
            onClick={handleSave}
            disabled={!isValid || saving}
          >
            {saving ? 'Guardando...' : 'Guardar contraseña'}
          </StoreButton>
        </div>
      </section>

      {/* ── MFA (deshabilitado) ── */}
      <section className="zoui-account__card zoui-account__card--roomy zoui-account__card--disabled">
        <div className="zoui-account__section-head zoui-account__section-head--split">
          <div className="zoui-account__section-head-main">
            <ShieldIcon />
            <Text variant="heading-3" className="zoui-account__card-title">Autenticación de dos factores</Text>
          </div>
          <span className="zoui-account__soon">
            Próximamente
          </span>
        </div>

        <div className="zoui-account__mfa">
          <div className="zoui-account__mfa-icon">
            <PhoneIcon />
          </div>
          <div className="zoui-account__mfa-body">
            <Text variant="body-sm" weight="medium">
              Aplicación de autenticación (TOTP)
            </Text>
            <Text variant="body-sm" color="muted">
              Usá una app como Google Authenticator o Authy para generar códigos temporales al iniciar sesión. Agrega una capa extra de seguridad a tu cuenta.
            </Text>

            <div className="zoui-account__mfa-state">
              <div>
                <Text variant="caption" color="muted">Estado</Text>
                <div className="zoui-account__inline">
                  <div className="zoui-account__dot" />
                  <Text variant="body-sm">No activado</Text>
                </div>
              </div>

              <StoreButton emphasis="outlined" size="sm" disabled>
                Activar
              </StoreButton>
            </div>
          </div>
        </div>
      </section>
      </div>
    </main>
  );
}
