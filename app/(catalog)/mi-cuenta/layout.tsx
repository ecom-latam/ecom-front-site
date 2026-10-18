'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessTokenRole } from '@/utils/helpers';
import { MiCuentaSidebar } from '@/components/catalog/MiCuentaSidebar';
import { AccountShell } from '@/components/catalog/AccountShell';

export default function MiCuentaLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const current = getAccessTokenRole();
    if (current === null) router.replace('/iniciar-sesion');
    else setRole(current);
  }, [router]);

  if (role === null) return null;

  return <AccountShell sidebar={<MiCuentaSidebar role={role} />}>{children}</AccountShell>;
}
