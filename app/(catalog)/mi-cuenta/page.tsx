'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessTokenRole } from '@/utils/helpers';

export default function MiCuentaPage() {
  const router = useRouter();
  useEffect(() => { router.replace(getAccessTokenRole() === 'Customer' ? '/mi-cuenta/pedidos' : '/mi-cuenta/avisos'); }, [router]);
  return null;
}
