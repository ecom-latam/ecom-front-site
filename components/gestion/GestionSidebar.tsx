'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from 'zoui';
import { usePageConfig } from '@/context/PageConfigContext';
import type React from 'react';

const ELEVATED_ROLES = ['Admin', 'Manager'];

interface NavItem {
  label: string;
  href: string;
  elevated: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  // EC-560: si se setea, el item solo se muestra cuando el modulo
  // correspondiente esta activo para el tipo de sitio (EC-558).
  requires?: 'catalog' | 'purchases';
}

interface NavGroup {
  label: string | null;
  items: NavItem[];
}

const ICON = {
  resumen: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  pedidos: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  ),
  productos: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  ),
  categorias: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  cuenta: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  opciones: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
};

const NAV_GROUPS: NavGroup[] = [
  { label: null, items: [
    { label: 'Resumen', href: '/gestion', elevated: false, icon: ICON.resumen },
  ] },
  { label: 'Ventas', items: [
    { label: 'Pedidos',  href: '/gestion/pedidos',  elevated: false, icon: ICON.pedidos, requires: 'purchases' },
  ] },
  { label: 'Cuenta', items: [
    { label: 'Mi cuenta', href: '/mi-cuenta', elevated: false, icon: ICON.cuenta },
  ] },
  { label: 'Catálogo', items: [
    { label: 'Productos',  href: '/gestion/productos',  elevated: true, icon: ICON.productos, requires: 'catalog' },
    { label: 'Categorías', href: '/gestion/categorias', elevated: true, icon: ICON.categorias, requires: 'catalog' },
    { label: 'Opciones',   href: '/gestion/opciones',   elevated: true, icon: ICON.opciones, requires: 'catalog' },
  ] },
];

interface Props {
  role: string;
}

export function GestionSidebar({ role }: Props) {
  const pathname = usePathname();
  const isElevated = ELEVATED_ROLES.includes(role);
  const { hasCatalog, hasPurchases } = usePageConfig();

  function itemVisible(item: NavItem): boolean {
    if (item.requires === 'catalog') return hasCatalog !== false;
    if (item.requires === 'purchases') return hasPurchases !== false;
    return true;
  }

  function renderItem(item: NavItem) {
    const isActive = item.href === '/gestion'
      ? pathname === '/gestion'
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

    if (item.disabled) {
      return (
        <Sidebar.Item key={item.href} disabled icon={item.icon}>
          {item.label}
        </Sidebar.Item>
      );
    }

    return (
      <Sidebar.Item
        key={item.href}
        href={item.href}
        active={isActive}
        icon={item.icon}
      >
        {item.label}
      </Sidebar.Item>
    );
  }

  const visibleGroups = NAV_GROUPS
    .map((group) => ({ ...group, items: group.items.filter((i) => (!i.elevated || isElevated) && itemVisible(i)) }))
    .filter((group) => group.items.length > 0);

  return (
    <Sidebar style={{ position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto' }}>
      <Sidebar.Header label="Panel" />
      <Sidebar.Nav>
        {visibleGroups.map((group, idx) => (
          <Sidebar.Group key={group.label ?? `group-${idx}`} label={group.label ?? undefined}>
            {group.items.map(renderItem)}
          </Sidebar.Group>
        ))}
      </Sidebar.Nav>
    </Sidebar>
  );
}
