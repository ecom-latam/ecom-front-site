import type { ReactNode } from 'react';
import styles from './AccountShell.module.scss';

export function AccountShell({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <div className={styles.side}>{sidebar}</div>
      <div className={styles.main}>{children}</div>
    </div>
  );
}
