'use client';

import { useState, useCallback } from 'react';

interface SaveButtonProps {
  productId: string;
}

export function SaveButton({ productId: _productId }: SaveButtonProps) {
  const [saved, setSaved] = useState(false);

  const toggle = useCallback(() => setSaved(s => !s), []);

  return (
    <button
      type="button"
      aria-label={saved ? 'Quitar de guardados' : 'Guardar producto'}
      aria-pressed={saved}
      onClick={toggle}
      style={{
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        width:           '44px',
        height:          '44px',
        border:          '1.5px solid var(--color-border-default)',
        borderRadius:    'var(--radius-md)',
        background:      'transparent',
        cursor:          'pointer',
        transition:      'border-color 120ms, background 120ms',
        flexShrink:      0,
        color:           saved ? 'var(--color-error-500)' : 'var(--color-fg-secondary)',
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
