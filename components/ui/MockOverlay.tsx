import type { ReactNode } from 'react';
import styles from './MockOverlay.module.scss';

interface MockOverlayProps {
  children: ReactNode;
  below?: boolean;
  label?: string;
}

// Marca un contenedor como datos de ejemplo: lo cubre con un velo gris desenfocado y una leyenda en diagonal. No intercepta clics.
export function MockOverlay({ children, below = false, label = 'Mockeado' }: MockOverlayProps) {
  return (
    <div className={below ? `${styles.root} ${styles.below}` : styles.root} data-testid="mock-overlay">
      {children}
      <div className={styles.veil} aria-hidden="true">
        <span className={styles.label}>{label}</span>
        <span className={styles.hint}>datos de ejemplo</span>
      </div>
    </div>
  );
}
