'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Los avisos pasaron a Mi cuenta; esta dirección queda por si hay un aviso viejo que apunta acá.
export default function AvisosMovidosPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/mi-cuenta/avisos'); }, [router]);
  return null;
}
