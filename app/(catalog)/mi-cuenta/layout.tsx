'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessTokenRole } from '@/utils/helpers';
import { MiCuentaSidebar } from '@/components/catalog/MiCuentaSidebar';

export default function MiCuentaLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const current = getAccessTokenRole();
    if (current === null) router.replace('/iniciar-sesion');
    else setRole(current);
  }, [router]);

  if (role === null) return null;

  return (
    <div style={{ display: 'flex' }}>
      <MiCuentaSidebar role={role} />
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}
