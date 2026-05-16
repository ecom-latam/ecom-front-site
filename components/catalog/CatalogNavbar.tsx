'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import { useCart } from '@/context/CartContext';
import { getAccessTokenRole } from '@/utils/helpers';

const MANAGEMENT_ROLES = ['Admin', 'Manager', 'Seller'];

export function CatalogNavbar() {
  const { itemCount, openDrawer } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    const role = getAccessTokenRole();
    setIsLoggedIn(!!localStorage.getItem('access_token'));
    setCanManage(role !== null && MANAGEMENT_ROLES.includes(role));
  }, []);

  async function handleLogout() {
    const BFF_URL = process.env.NEXT_PUBLIC_BFF_URL ?? 'http://localhost:4000';
    await fetch(`${BFF_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
    localStorage.removeItem('access_token');
    document.cookie = '_auth=; path=/; max-age=0';
    setIsLoggedIn(false);
    window.location.href = '/productos';
  }

  return (
    <header className="navbar navbar--bordered" style={{ position: 'sticky', top: 0, zIndex: 40 }}>
      <div className="navbar__inner">
        <Link href="/productos" className="navbar__logo">
          Tienda
        </Link>

        <div className="navbar__links">
          {canManage && (
            <Link href="/gestion" className="btn btn--ghost btn--sm" style={{ fontWeight: 500 }}>
              Gestión
            </Link>
          )}
        </div>

        <div className="navbar__actions">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="btn btn--ghost btn--rounded btn--sm"
            >
              Salir
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link href="/iniciar-sesion" className="btn btn--ghost btn--rounded btn--sm">
                Iniciar sesión
              </Link>
              <Link href="/registro" className="btn btn--outlined btn--rounded btn--sm">
                Registrate
              </Link>
            </div>
          )}

          <button
            onClick={openDrawer}
            className="navbar__cart"
            aria-label={`Carrito${itemCount > 0 ? `, ${itemCount} items` : ''}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>

            {itemCount > 0 && (
              <span className="navbar__cart-badge">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
