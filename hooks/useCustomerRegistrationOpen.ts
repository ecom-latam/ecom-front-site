'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/utils/api';

// null mientras consulta; si no se puede leer se deja abierto (la barrera real es el servidor).
export function useCustomerRegistrationOpen(): boolean | null {
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    auth
      .registrationStatus()
      .then((res) => { if (!cancelled) setOpen(res.data.customer === true); })
      .catch(() => { if (!cancelled) setOpen(true); });
    return () => { cancelled = true; };
  }, []);

  return open;
}
