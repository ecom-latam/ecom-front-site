'use client';

import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { categories as categoriesApi } from '@/utils/api';
import type { Category, CategoryPayload } from '@/utils/api';

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<Category['status'], React.CSSProperties> = {
  active:   { background: '#dcfce7', color: '#166534' },
  inactive: { background: '#f3f4f6', color: '#6b7280' },
};

const STATUS_LABELS: Record<Category['status'], string> = {
  active:   'Activa',
  inactive: 'Inactiva',
};

// ─── Modal ───────────────────────────────────────────────────────────────────

const MAX_DEPTH = 3;

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
      <div style={{
        position: 'relative', zIndex: 1, background: '#fff', borderRadius: '12px',
        padding: '28px', width: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '10px' }}>{title}</h3>
        <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, marginBottom: '24px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={btnGhostStyle}>Cancelar</button>
          <button onClick={onConfirm} style={{
            ...btnPrimaryStyle,
            background: danger ? '#dc2626' : '#111827',
          }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function buildDepthMap(categories: Category[]): Map<string, number> {
  const map = new Map<string, number>();
  const byId = new Map(categories.map(c => [c._id, c]));
  function depth(id: string): number {
    if (map.has(id)) return map.get(id)!;
    const cat = byId.get(id);
    const d = cat?.parentId ? depth(cat.parentId) + 1 : 0;
    map.set(id, d);
    return d;
  }
  categories.forEach(c => depth(c._id));
  return map;
}

interface ModalProps {
  category: Category | null;
  allCategories: Category[];
  depthMap: Map<string, number>;
  onClose: () => void;
  onSaved: () => void;
}

function CategoryModal({ category, allCategories, depthMap, onClose, onSaved }: ModalProps) {
  const [name, setName] = useState(category?.name ?? '');
  const [parentId, setParentId] = useState<string>(category?.parentId ?? '');
  const [status, setStatus] = useState<Category['status']>(category?.status ?? 'active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Only show categories that can accept children (depth < MAX_DEPTH) and aren't self
  const candidates = allCategories.filter(
    c => c._id !== category?._id && c.status === 'active' && (depthMap.get(c._id) ?? 0) < MAX_DEPTH
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload: CategoryPayload = {
        name: name.trim(),
        parentId: parentId || null,
        status,
      };
      if (category) {
        await categoriesApi.update(category._id, payload);
      } else {
        await categoriesApi.create(payload);
      }
      onSaved();
    } catch (err) {
      if (isAxiosError(err)) {
        const code = err.response?.data?.error;
        setError(
          code === 'SLUG_CONFLICT'    ? 'Ya existe una categoría con ese nombre.' :
          code === 'MAX_DEPTH_EXCEEDED' ? 'No se puede anidar más de 4 niveles.' :
          (code ?? 'Error al guardar la categoría.')
        );
      } else {
        setError('Error inesperado.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />

      <div style={{
        position: 'relative', zIndex: 1,
        width: '420px', height: '100vh',
        background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
            {category ? 'Editar categoría' : 'Nueva categoría'}
          </h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, color: '#6b7280' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={labelStyle}>Nombre *</label>
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              style={inputStyle}
              placeholder="Ej: Ropa de hombre"
            />
          </div>

          <div>
            <label style={labelStyle}>Categoría padre</label>
            <select
              value={parentId}
              onChange={e => setParentId(e.target.value)}
              style={inputStyle}
            >
              <option value="">Sin categoría padre (raíz)</option>
              {candidates.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px' }}>
              Solo se muestran categorías que pueden recibir subcategorías (máximo 4 niveles).
            </p>
          </div>

          <div>
            <label style={labelStyle}>Estado</label>
            <select value={status} onChange={e => setStatus(e.target.value as Category['status'])} style={inputStyle}>
              <option value="active">Activa</option>
              <option value="inactive">Inactiva</option>
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
              {loading ? 'Guardando...' : category ? 'Guardar cambios' : 'Crear categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function GestionCategoriasPage() {
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Category['status'] | ''>('active');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const [confirm, setConfirm] = useState<{ title: string; message: string; confirmLabel: string; danger?: boolean; onConfirm: () => void } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { data } = await categoriesApi.list();
      setCategoryList(data);
      const parentIds = new Set(data.map(c => c.parentId).filter(Boolean) as string[]);
      setCollapsed(parentIds);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const parentMap = Object.fromEntries(categoryList.map(c => [c._id, c.name]));

  const filtered = categoryList.filter(c => {
    if (statusFilter && c.status !== statusFilter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Recursive sort: each node immediately followed by all its descendants
  function buildSorted(parentId: string | null, depth: number): { category: Category; depth: number }[] {
    return filtered
      .filter(c => (c.parentId ?? null) === parentId)
      .flatMap(c => [{ category: c, depth }, ...buildSorted(c._id, depth + 1)]);
  }
  const sorted = buildSorted(null, 0);

  const depthMap = buildDepthMap(categoryList);
  const childrenIds = new Set(sorted.map(({ category }) => category.parentId).filter(Boolean));

  function hasChildren(id: string) {
    return childrenIds.has(id);
  }

  function isVisible(category: Category): boolean {
    let parentId = category.parentId;
    while (parentId) {
      if (collapsed.has(parentId)) return false;
      parentId = categoryList.find(c => c._id === parentId)?.parentId ?? null;
    }
    return true;
  }

  function toggleCollapse(id: string) {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setModalOpen(true);
  }

  function handleToggleStatus(category: Category) {
    const newStatus = category.status === 'active' ? 'inactive' : 'active';
    const hasChildren = categoryList.some(c => c.parentId === category._id);

    const doToggle = async () => {
      setConfirm(null);
      try {
        await categoriesApi.update(category._id, { status: newStatus });
        load();
      } catch {
        // silent — could show inline error in future
      }
    };

    if (newStatus === 'inactive' && hasChildren) {
      setConfirm({
        title: 'Desactivar categoría',
        message: `Al desactivar "${category.name}" todas las subcategorías que dependen de ella también serán desactivadas.`,
        confirmLabel: 'Desactivar',
        danger: false,
        onConfirm: doToggle,
      });
    } else {
      doToggle();
    }
  }

  function handleDelete(category: Category) {
    const hasChildren = categoryList.some(c => c.parentId === category._id);
    setConfirm({
      title: 'Eliminar categoría',
      message: hasChildren
        ? `¿Querés eliminar "${category.name}"? Todas las subcategorías que dependen de ella también serán eliminadas. Esta acción no se puede deshacer.`
        : `¿Querés eliminar "${category.name}"? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      danger: true,
      onConfirm: async () => {
        setConfirm(null);
        try {
          await categoriesApi.delete(category._id);
          load();
        } catch {
          // silent
        }
      },
    });
  }

  function handleSaved() {
    setModalOpen(false);
    load();
  }

  return (
    <main style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>Categorías</h1>
        <button onClick={openCreate} style={btnPrimaryStyle}>
          + Nueva categoría
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre..."
          style={{ ...inputStyle, width: '260px' }}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as Category['status'] | '')}
          style={{ ...inputStyle, width: '160px' }}
        >
          <option value="">Todas</option>
          <option value="active">Activas</option>
          <option value="inactive">Inactivas</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '40%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '13.33%' }} />
            <col style={{ width: '26.67%' }} />
          </colgroup>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Nombre', 'Categoría padre', 'Estado', 'Acciones'].map((col, i) => (
                <th key={i} style={{ padding: '10px 20px', textAlign: i === 0 ? 'left' : 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                  Cargando...
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                  {search || statusFilter !== 'active' ? 'Sin resultados para los filtros aplicados.' : 'Todavía no hay categorías. ¡Creá la primera!'}
                </td>
              </tr>
            ) : sorted.filter(({ category }) => isVisible(category)).map(({ category, depth }, i) => (
              <tr key={category._id} style={{ borderTop: i === 0 ? 'none' : '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px 20px', fontSize: '14px', color: '#111827', fontWeight: depth === 0 ? 500 : 400 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingLeft: `${depth * 20}px` }}>
                    {hasChildren(category._id) ? (
                      <button
                        onClick={() => toggleCollapse(category._id)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px 4px', color: '#9ca3af', flexShrink: 0, lineHeight: 1 }}
                      >
                        {collapsed.has(category._id) ? '▶' : '▼'}
                      </button>
                    ) : (
                      <span style={{ width: '20px', flexShrink: 0, display: 'inline-block' }} />
                    )}
                    {depth > 0 && (
                      <span style={{ color: '#9ca3af', fontSize: '15px', lineHeight: 1, flexShrink: 0 }}>↳</span>
                    )}
                    {category.name}
                  </div>
                </td>
                <td style={{ padding: '14px 20px', fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>
                  {category.parentId ? (parentMap[category.parentId] ?? '—') : (
                    <span style={{ fontSize: '12px', background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: '999px' }}>raíz</span>
                  )}
                </td>
                <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                  <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 500, ...STATUS_STYLES[category.status] }}>
                    {STATUS_LABELS[category.status]}
                  </span>
                </td>
                <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button onClick={() => handleToggleStatus(category)} style={{ ...btnGhostSmallStyle, minWidth: '90px', flexShrink: 0, textAlign: 'center', padding: '5px 0', color: category.status === 'active' ? '#d97706' : '#16a34a' }}>
                      {category.status === 'active' ? 'Desactivar' : 'Activar'}
                    </button>
                    <button onClick={() => openEdit(category)} style={btnGhostSmallStyle}>Editar</button>
                    <button onClick={() => handleDelete(category)} style={{ ...btnGhostSmallStyle, color: '#dc2626' }}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {!loading && categoryList.length > 0 && (
        <p style={{ marginTop: '12px', fontSize: '13px', color: '#9ca3af' }}>
          {sorted.length} categoría{sorted.length !== 1 ? 's' : ''} · {categoryList.filter(c => c.status === 'active').length} activa{categoryList.filter(c => c.status === 'active').length !== 1 ? 's' : ''} · {categoryList.filter(c => c.status === 'inactive').length} inactiva{categoryList.filter(c => c.status === 'inactive').length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Modal */}
      {modalOpen && (
        <CategoryModal
          category={editing}
          allCategories={categoryList}
          depthMap={depthMap}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          danger={confirm.danger}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
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
