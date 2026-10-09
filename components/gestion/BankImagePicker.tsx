'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge, Modal, Text, optimizedImageUrl } from 'zoui';
import { bankImages, type BankImage } from '@/utils/api';
import { StoreButton } from '@/components/ui/StoreButton';
import { StoreInput } from '@/components/ui/StoreInput';

const PAGE_SIZE = 24;
const SEARCH_DELAY_MS = 300;

interface BankImagePickerProps {
  title:      string;
  remaining:  number;
  taken:      string[];
  onConfirm:  (publicIds: string[]) => Promise<void> | void;
  onClose:    () => void;
}

// Elegir imagenes del banco del sitio para un producto o una variante. Las que ya tiene quedan marcadas y no se pueden volver a elegir.
export function BankImagePicker({ title, remaining, taken, onConfirm, onClose }: BankImagePickerProps) {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [items, setItems] = useState<BankImage[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const load = useCallback(async (targetPage: number, replace: boolean) => {
    setLoading(true);
    setFailed(false);
    try {
      const { data } = await bankImages.list({ q: debounced, page: targetPage, limit: PAGE_SIZE });
      setItems((current) => (replace ? data.data : [...current, ...data.data]));
      setTotal(data.total);
      setPage(targetPage);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [debounced]);

  useEffect(() => {
    void load(1, true);
  }, [load]);

  function toggle(image: BankImage) {
    if (taken.includes(image.publicId)) return;
    setSelected((current) => {
      if (current.includes(image.publicId)) return current.filter((id) => id !== image.publicId);
      return current.length >= remaining ? current : [...current, image.publicId];
    });
  }

  async function confirm() {
    if (selected.length === 0 || saving) return;
    setSaving(true);
    try {
      await onConfirm(selected);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const empty = !loading && !failed && items.length === 0;

  return (
    <Modal open size="lg" onClose={onClose}>
      <Modal.Header>{title}</Modal.Header>
      <Modal.Body>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} data-testid="bank-picker">
          <StoreInput placeholder="Buscar por nombre" value={query} onChange={(event) => setQuery(event.target.value)} data-testid="bank-picker-search" />
          {failed && <Text variant="body-sm" color="danger">No se pudo cargar tu banco de imágenes. Probá de nuevo en un momento.</Text>}
          {empty && (
            <Text variant="body-sm" color="muted" data-testid="bank-picker-empty">
              {debounced ? 'No hay imágenes con ese nombre.' : 'Tu banco de imágenes está vacío. Subí imágenes desde la pantalla Imágenes del panel y volvé a elegirlas acá.'}
            </Text>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px' }}>
            {items.map((image) => {
              const isTaken = taken.includes(image.publicId);
              const isSelected = selected.includes(image.publicId);
              const locked = !isSelected && !isTaken && selected.length >= remaining;
              return (
                <button
                  key={image._id} type="button" onClick={() => toggle(image)} disabled={isTaken || locked}
                  aria-pressed={isSelected} title={image.name} data-testid="bank-image" data-selected={isSelected || undefined} data-taken={isTaken || undefined}
                  style={{
                    position: 'relative', padding: 0, cursor: isTaken || locked ? 'not-allowed' : 'pointer', opacity: isTaken || locked ? 0.5 : 1,
                    border: `2px solid ${isSelected ? 'var(--color-brand-500)' : 'var(--color-border-default)'}`, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'none',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={optimizedImageUrl(image.url, 240)} alt={image.alt || image.name} style={{ width: '100%', height: 90, objectFit: 'cover', display: 'block' }} />
                  {isTaken && <Badge tone="neutral" variant="pill" style={{ position: 'absolute', top: 4, left: 4 }}>Ya está</Badge>}
                  {isSelected && <Badge tone="success" variant="pill" style={{ position: 'absolute', top: 4, left: 4 }}>{selected.indexOf(image.publicId) + 1}</Badge>}
                </button>
              );
            })}
          </div>
          {items.length < total && (
            <div>
              <StoreButton size="sm" emphasis="outlined" disabled={loading} onClick={() => { void load(page + 1, false); }} data-testid="bank-picker-more">Cargar más</StoreButton>
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Text variant="body-sm" color="muted" data-testid="bank-picker-count">
          {selected.length === 0 ? `Podés elegir hasta ${remaining}` : `${selected.length} de ${remaining} elegidas`}
        </Text>
        <StoreButton size="md" emphasis="outlined" onClick={onClose}>Cancelar</StoreButton>
        <StoreButton size="md" emphasis="filled" disabled={selected.length === 0 || saving} onClick={() => { void confirm(); }} data-testid="bank-pick-confirm">
          {saving ? 'Agregando...' : 'Agregar'}
        </StoreButton>
      </Modal.Footer>
    </Modal>
  );
}
