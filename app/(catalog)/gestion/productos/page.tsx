'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { products as productsApi, categories as categoriesApi } from '@/utils/api';
import type { Product, ProductPayload, ProductStatus, Category } from '@/utils/api';

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<ProductStatus, string> = {
  active:   'Activo',
  draft:    'Borrador',
  paused:   'Inactivo',
  archived: 'Archivado',
};

const STATUS_STYLES: Record<ProductStatus, React.CSSProperties> = {
  active:   { background: '#dcfce7', color: '#166534' },
  draft:    { background: '#f3f4f6', color: '#374151' },
  paused:   { background: '#fef9c3', color: '#854d0e' },
  archived: { background: '#fee2e2', color: '#991b1b' },
};

const FILTER_OPTIONS: { label: string; value: ProductStatus | '' }[] = [
  { label: 'Todos', value: '' },
  { label: 'Activos', value: 'active' },
  { label: 'Borradores', value: 'draft' },
  { label: 'Inactivos', value: 'paused' },
];

const LIMIT = 20;

const EMPTY_FORM: ProductPayload = {
  name: '',
  description: '',
  price: 0,
  salePrice: null,
  stock: 0,
  categoryId: null,
  status: 'draft',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(n: number) {
  return '$' + n.toLocaleString('es-AR');
}

function MainImage({ images }: { images: Product['images'] }) {
  const main = images.find(i => i.isMain) ?? images[0];
  if (!main) {
    return (
      <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={main.url} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1px solid #e5e7eb' }} />
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({ title, message, confirmLabel, danger = false, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onCancel} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
      <div style={{ position: 'relative', zIndex: 1, background: '#fff', borderRadius: '12px', padding: '28px', width: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '10px' }}>{title}</h3>
        <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, marginBottom: '24px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={btnGhostStyle}>Cancelar</button>
          <button onClick={onConfirm} style={{ ...btnPrimaryStyle, background: danger ? '#dc2626' : '#111827' }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────

interface ModalProps {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

function ProductModal({ product, categories, onClose, onSaved }: ModalProps) {
  const [form, setForm] = useState<ProductPayload>(
    product
      ? {
          name: product.name,
          description: product.description,
          price: product.price,
          salePrice: product.salePrice,
          stock: product.stock,
          categoryId: product.categoryId,
          status: product.status,
        }
      : EMPTY_FORM
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set<K extends keyof ProductPayload>(key: K, value: ProductPayload[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (product) {
        await productsApi.update(product._id, form);
      } else {
        await productsApi.create(form);
      }
      onSaved();
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.error ?? 'Error al guardar el producto.');
      } else {
        setError('Error inesperado.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }}
      />

      {/* Panel */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '480px', height: '100vh',
        background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
            {product ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, color: '#6b7280' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Nombre */}
          <div>
            <label style={labelStyle}>Nombre *</label>
            <input
              required
              value={form.name}
              onChange={e => set('name', e.target.value)}
              style={inputStyle}
              placeholder="Ej: Remera de algodón"
            />
          </div>

          {/* Descripción */}
          <div>
            <label style={labelStyle}>Descripción</label>
            <textarea
              value={form.description ?? ''}
              onChange={e => set('description', e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Descripción del producto"
            />
          </div>

          {/* Precio + Precio oferta */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Precio *</label>
              <input
                required
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={e => set('price', parseFloat(e.target.value) || 0)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Precio de oferta</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.salePrice ?? ''}
                onChange={e => set('salePrice', e.target.value ? parseFloat(e.target.value) : null)}
                style={inputStyle}
                placeholder="Opcional"
              />
            </div>
          </div>

          {/* Stock + Categoría */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Stock</label>
              <input
                type="number"
                min={0}
                value={form.stock ?? 0}
                onChange={e => set('stock', parseInt(e.target.value) || 0)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Categoría</label>
              <select
                value={form.categoryId ?? ''}
                onChange={e => set('categoryId', e.target.value || null)}
                style={inputStyle}
              >
                <option value="">Sin categoría</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Estado */}
          <div>
            <label style={labelStyle}>Estado</label>
            <select
              value={form.status}
              onChange={e => set('status', e.target.value as ProductStatus)}
              style={inputStyle}
            >
              {(Object.keys(STATUS_LABELS) as ProductStatus[]).filter(s => s !== 'archived').map(s => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          {error && (
            <p style={{ fontSize: '13px', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px' }}>
              {error}
            </p>
          )}

          <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={btnGhostStyle}>Cancelar</button>
            <button type="submit" disabled={loading} style={btnPrimaryStyle}>
              {loading ? 'Guardando...' : product ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function GestionProductosPage() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | ''>('');

  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [categoryList, setCategoryList] = useState<Category[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; confirmLabel: string; danger?: boolean; onConfirm: () => void } | null>(null);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPages = Math.ceil(total / LIMIT);

  const load = useCallback(async (p: number, q: string, status: ProductStatus | '') => {
    setLoading(true);
    try {
      const params = { page: p, limit: LIMIT, ...(q ? { q } : {}), ...(status ? { status } : {}) };
      const { data } = await productsApi.list(params);
      setProductList(data.data);
      setTotal(data.total);
    } catch {
      // silent — table shows empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page, search, statusFilter);
  }, [load, page, statusFilter]); // search handled via debounce below

  useEffect(() => {
    categoriesApi.list().then(({ data }) => {
      setCategoryList(data);
      setCategoryMap(Object.fromEntries(data.map(c => [c._id, c.name])));
    }).catch(() => {});
  }, []);

  function handleSearch(value: string) {
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      load(1, value, statusFilter);
    }, 350);
  }

  function handleStatusFilter(value: ProductStatus | '') {
    setStatusFilter(value);
    setPage(1);
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setModalOpen(true);
  }

  function handleToggleStatus(product: Product) {
    const newStatus = product.status === 'active' ? 'paused' : 'active';
    const doToggle = async () => {
      setConfirmModal(null);
      try {
        await productsApi.update(product._id, { status: newStatus });
        load(page, search, statusFilter);
      } catch { /* silent */ }
    };
    if (newStatus === 'paused') {
      setConfirmModal({
        title: 'Desactivar producto',
        message: `¿Querés desactivar "${product.name}"? Dejará de estar visible en la tienda.`,
        confirmLabel: 'Desactivar',
        onConfirm: doToggle,
      });
    } else {
      doToggle();
    }
  }

  function handleDelete(product: Product) {
    setConfirmModal({
      title: 'Eliminar producto',
      message: `¿Querés eliminar "${product.name}"? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      danger: true,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await productsApi.delete(product._id);
          load(page, search, statusFilter);
        } catch { /* silent */ }
      },
    });
  }

  function handleSaved() {
    setModalOpen(false);
    load(page, search, statusFilter);
  }

  return (
    <main style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>Productos</h1>
        <button onClick={openCreate} style={btnPrimaryStyle}>
          + Nuevo producto
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <input
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Buscar por nombre..."
          style={{ ...inputStyle, width: '280px' }}
        />
        <select
          value={statusFilter}
          onChange={e => handleStatusFilter(e.target.value as ProductStatus | '')}
          style={{ ...inputStyle, width: '160px' }}
        >
          {FILTER_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['', 'Nombre', 'Estado', 'Categoría', 'Precio', 'Stock', 'Acciones'].map((col, i) => (
                <th key={i} style={{ padding: '10px 16px', textAlign: i === 0 || i === 1 ? 'left' : 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                  Cargando...
                </td>
              </tr>
            ) : productList.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                  {search || statusFilter ? 'Sin resultados para los filtros aplicados.' : 'Todavía no hay productos. ¡Creá el primero!'}
                </td>
              </tr>
            ) : productList.map((product, i) => (
              <tr key={product._id} style={{ borderTop: i === 0 ? 'none' : '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px 16px', width: 56 }}>
                  <MainImage images={product.images} />
                </td>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827', fontWeight: 500, maxWidth: '240px' }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
                  {product.salePrice !== null && (
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: 2 }}>
                      Oferta: {formatPrice(product.salePrice)}
                    </div>
                  )}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 500, ...STATUS_STYLES[product.status] }}>
                    {STATUS_LABELS[product.status]}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>
                  {product.categoryId ? (categoryMap[product.categoryId] ?? '—') : '—'}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151', whiteSpace: 'nowrap', textAlign: 'center' }}>
                  {formatPrice(product.price)}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151', textAlign: 'center' }}>
                  {product.stock}
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button onClick={() => handleToggleStatus(product)} style={{ ...btnGhostSmallStyle, minWidth: '90px', flexShrink: 0, textAlign: 'center', padding: '5px 0', color: product.status === 'active' ? '#d97706' : '#16a34a' }}>
                      {product.status === 'active' ? 'Desactivar' : 'Activar'}
                    </button>
                    <button onClick={() => openEdit(product)} style={btnGhostSmallStyle}>Editar</button>
                    <button onClick={() => handleDelete(product)} style={{ ...btnGhostSmallStyle, color: '#dc2626' }}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>
            {total} productos · página {page} de {totalPages}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={btnGhostSmallStyle}
            >
              ← Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={btnGhostSmallStyle}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <ProductModal
          product={editing}
          categories={categoryList}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel}
          danger={confirmModal.danger}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </main>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  fontSize: '14px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
  color: '#111827',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '6px',
};

const btnPrimaryStyle: React.CSSProperties = {
  padding: '9px 18px',
  fontSize: '14px',
  fontWeight: 600,
  color: '#fff',
  background: '#111827',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
};

const btnGhostStyle: React.CSSProperties = {
  padding: '9px 18px',
  fontSize: '14px',
  fontWeight: 500,
  color: '#374151',
  background: 'transparent',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  cursor: 'pointer',
};

const btnGhostSmallStyle: React.CSSProperties = {
  padding: '5px 12px',
  fontSize: '13px',
  fontWeight: 500,
  color: '#374151',
  background: 'transparent',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  cursor: 'pointer',
};
