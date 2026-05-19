'use client';

import { useEffect, useState } from 'react';
import { Button, Text, Input, Select, Badge, Modal } from 'zoui';
import { addresses } from '@/utils/api/addresses';
import type { Address, AddressPayload } from '@/utils/api/addresses';

const MAX = 5;

const Req = () => (
  <span style={{ color: 'var(--color-error-500)', marginLeft: '2px' }} aria-hidden="true">*</span>
);

const PROVINCES = [
  'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut',
  'Ciudad Autónoma de Buenos Aires', 'Córdoba', 'Corrientes', 'Entre Ríos',
  'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones',
  'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz',
  'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
];

const EMPTY_FORM: AddressPayload = {
  label: '', fullName: '', phone: '', address: '', floor: '',
  city: '', province: '', zip: '',
};

const LocationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const StarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default function DireccionesPage() {
  const [list, setList]         = useState<Address[]>([]);
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]   = useState<Address | null>(null);
  const [form, setForm]         = useState<AddressPayload>(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [settingDefault, setSettingDefault] = useState<string | null>(null);
  const [touched, setTouched] = useState<Partial<Record<keyof AddressPayload, boolean>>>({});

  useEffect(() => {
    addresses.list()
      .then((r) => setList(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError(null);
    setTouched({});
    setModalOpen(true);
  }

  function openEdit(addr: Address) {
    setEditing(addr);
    setForm({
      label: addr.label, fullName: addr.fullName, phone: addr.phone,
      address: addr.address, floor: addr.floor, city: addr.city,
      province: addr.province, zip: addr.zip,
    });
    setError(null);
    setTouched({});
    setModalOpen(true);
  }

  function set(field: keyof AddressPayload, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  function touch(field: keyof AddressPayload) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function validate(f: AddressPayload): Partial<Record<keyof AddressPayload, string>> {
    const e: Partial<Record<keyof AddressPayload, string>> = {};
    if (!f.label.trim()) e.label = 'Requerido.';
    if (!f.fullName.trim()) e.fullName = 'Requerido.';
    else if (/\d/.test(f.fullName)) e.fullName = 'No puede contener números.';
    if (!f.phone.trim()) e.phone = 'Requerido.';
    else if (f.phone.replace(/\D/g, '').length < 7) e.phone = 'Mínimo 7 dígitos.';
    else if (f.phone.replace(/\D/g, '').length > 15) e.phone = 'Máximo 15 dígitos.';
    if (!f.address.trim()) e.address = 'Requerido.';
    if (!f.city.trim()) e.city = 'Requerido.';
    else if (/\d/.test(f.city)) e.city = 'No puede contener números.';
    if (!f.province) e.province = 'Seleccioná una provincia.';
    if (f.zip && !/^\d{4,8}$/.test(f.zip)) e.zip = 'Solo números (4 a 8 dígitos).';
    return e;
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        const { data } = await addresses.update(editing._id, form);
        setList((prev) => prev.map((a) => (a._id === data._id ? data : a)));
      } else {
        const { data } = await addresses.create(form);
        setList((prev) => [...prev, data]);
      }
      setModalOpen(false);
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: string } } };
      const code = axErr?.response?.data?.error;
      if (code === 'ADDRESS_LIMIT_REACHED') setError('Llegaste al límite de 5 direcciones.');
      else if (code?.startsWith('MISSING_')) setError('Completá todos los campos requeridos.');
      else setError('Ocurrió un error. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await addresses.remove(id);
      setList((prev) => prev.filter((a) => a._id !== id));
    } finally {
      setDeleting(null);
    }
  }

  async function handleSetDefault(id: string) {
    setSettingDefault(id);
    try {
      const { data } = await addresses.setDefault(id);
      setList((prev) => prev.map((a) => ({ ...a, isDefault: a._id === data._id })));
    } finally {
      setSettingDefault(null);
    }
  }

  const count = list.length;
  const atLimit = count >= MAX;
  const formErrors = validate(form);
  const isFormValid = Object.keys(formErrors).length === 0;

  return (
    <main style={{ padding: '32px 24px', maxWidth: 680 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <Text variant="heading-2" as="h1">Mis direcciones</Text>
          <Text variant="body-sm" color="muted" as="p" style={{ marginTop: '4px' }}>
            Guardá hasta 5 direcciones de envío
          </Text>
        </div>
        <Button
          variant="filled"
          shape="rounded"
          size="md"
          onClick={openCreate}
          disabled={atLimit}
          title={atLimit ? 'Llegaste al límite de 5 direcciones' : undefined}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
        >
          <PlusIcon />
          Agregar
        </Button>
      </div>

      {/* Slots indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          {Array.from({ length: MAX }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 28,
                height: 6,
                borderRadius: 3,
                background: i < count
                  ? 'var(--color-brand-500)'
                  : 'var(--color-border-default)',
                transition: 'background 0.2s',
              }}
            />
          ))}
        </div>
        <Text variant="caption" color={atLimit ? 'default' : 'muted'} style={{ fontWeight: atLimit ? 600 : 400 }}>
          {count} / {MAX}
          {atLimit && ' — límite alcanzado'}
        </Text>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2].map((n) => (
            <div key={n} style={{ height: 120, borderRadius: 'var(--radius-lg)', background: 'var(--color-bg-subtle)', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : count === 0 ? (
        <div style={{
          border: '2px dashed var(--color-border-default)',
          borderRadius: 'var(--radius-lg)',
          padding: '48px 24px',
          textAlign: 'center',
        }}>
          <div style={{ color: 'var(--color-fg-disabled)', marginBottom: '12px' }}>
            <LocationIcon />
          </div>
          <Text variant="body" color="muted" as="p">Todavía no tenés direcciones guardadas.</Text>
          <Text variant="body-sm" color="muted" as="p" style={{ marginTop: '6px' }}>
            Usá el botón "Agregar" para guardar tu primera dirección de envío.
          </Text>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {list.map((addr) => (
            <div
              key={addr._id}
              style={{
                background: 'var(--color-bg-default)',
                border: addr.isDefault
                  ? '2px solid var(--color-brand-500)'
                  : '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                position: 'relative',
              }}
            >
              {/* Label + badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Text variant="body-sm" weight="semibold" as="span">{addr.label}</Text>
                {addr.isDefault && (
                  <Badge type="info" shape="pill" size="sm">Predeterminada</Badge>
                )}
              </div>

              {/* Address data */}
              <Text variant="body-sm" color="muted" as="p">
                {addr.fullName} · {addr.phone}
              </Text>
              <Text variant="body-sm" color="muted" as="p">
                {addr.address}{addr.floor ? `, ${addr.floor}` : ''}
              </Text>
              <Text variant="body-sm" color="muted" as="p">
                {addr.city}, {addr.province}{addr.zip ? ` (${addr.zip})` : ''}
              </Text>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                <Button
                  variant="ghost"
                  shape="rounded"
                  size="sm"
                  onClick={() => openEdit(addr)}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <EditIcon /> Editar
                </Button>

                {!addr.isDefault && (
                  <Button
                    variant="ghost"
                    shape="rounded"
                    size="sm"
                    disabled={settingDefault === addr._id}
                    onClick={() => handleSetDefault(addr._id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <StarIcon />
                    {settingDefault === addr._id ? 'Guardando...' : 'Marcar predeterminada'}
                  </Button>
                )}

                <Button
                  variant="ghost"
                  shape="rounded"
                  size="sm"
                  disabled={deleting === addr._id}
                  onClick={() => handleDelete(addr._id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-error-600)' }}
                >
                  <TrashIcon />
                  {deleting === addr._id ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} size="md">
        <Modal.Header>
          <Text variant="heading-3" as="h2">
            {editing ? 'Editar dirección' : 'Nueva dirección'}
          </Text>
        </Modal.Header>

        <Modal.Body>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Etiqueta"
              labelAction={<Req />}
              placeholder='Ej: "Casa", "Trabajo"'
              value={form.label}
              onChange={(e) => set('label', e.target.value)}
              onBlur={() => touch('label')}
              error={touched.label ? formErrors.label : undefined}
              maxLength={30}
              variant="outlined"
              size="md"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <Input
                  label="Nombre completo"
                  labelAction={<Req />}
                  value={form.fullName}
                  onChange={(e) => set('fullName', e.target.value.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'.-]/g, ''))}
                  onBlur={() => touch('fullName')}
                  error={touched.fullName ? formErrors.fullName : undefined}
                  variant="outlined"
                  size="md"
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Input
                  label="Teléfono"
                  labelAction={<Req />}
                  placeholder="Ej: 1112345678"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value.replace(/\D/g, ''))}
                  onBlur={() => touch('phone')}
                  error={touched.phone ? formErrors.phone : undefined}
                  inputMode="tel"
                  variant="outlined"
                  size="md"
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Input
                  label="Dirección"
                  labelAction={<Req />}
                  placeholder="Calle y número"
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                  onBlur={() => touch('address')}
                  error={touched.address ? formErrors.address : undefined}
                  variant="outlined"
                  size="md"
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Input
                  label="Piso / Depto"
                  hint="Opcional"
                  placeholder="Ej: 3° B"
                  value={form.floor}
                  onChange={(e) => set('floor', e.target.value)}
                  variant="outlined"
                  size="md"
                />
              </div>
              <div>
                <Input
                  label="Ciudad"
                  labelAction={<Req />}
                  value={form.city}
                  onChange={(e) => set('city', e.target.value.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'.-]/g, ''))}
                  onBlur={() => touch('city')}
                  error={touched.city ? formErrors.city : undefined}
                  variant="outlined"
                  size="md"
                />
              </div>
              <div>
                <Input
                  label="Código postal"
                  hint="Opcional"
                  placeholder="Ej: 1425"
                  value={form.zip}
                  onChange={(e) => set('zip', e.target.value.replace(/\D/g, '').slice(0, 8))}
                  onBlur={() => touch('zip')}
                  error={touched.zip ? formErrors.zip : undefined}
                  inputMode="numeric"
                  variant="outlined"
                  size="md"
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Select
                  label="Provincia"
                  labelAction={<Req />}
                  value={form.province}
                  onChange={(e) => set('province', e.target.value)}
                  onBlur={() => touch('province')}
                  error={touched.province ? formErrors.province : undefined}
                  variant="outlined"
                  size="md"
                >
                  <option value="">Seleccioná una provincia</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </Select>
              </div>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: 'var(--color-error-50)', border: '1px solid var(--color-error-200)', borderRadius: 'var(--radius-md)' }}>
                <Text variant="body-sm" style={{ color: 'var(--color-error-700)' }} as="p">{error}</Text>
              </div>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="ghost" shape="rounded" size="md" onClick={() => setModalOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="filled" shape="rounded" size="md" onClick={handleSave} disabled={saving || !isFormValid}>
            {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Agregar dirección'}
          </Button>
        </Modal.Footer>
      </Modal>
    </main>
  );
}
