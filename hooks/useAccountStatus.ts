'use client';

import { useCallback, useEffect, useState } from 'react';
import { auth } from '@/utils/api/auth';

export interface AccountStatus {
  email: string | null;
  emailVerified: boolean;
  mfaEnabled: boolean;
  isAdmin: boolean;
}

interface Me {
  email?: string;
  emailVerified?: boolean;
  mfaEnabled?: boolean;
  roles?: Array<{ role: string }>;
}

// null mientras consulta o si no hay sesión. Ante un error se asume una cuenta en regla: el backend es la barrera real.
export function useAccountStatus(): { status: AccountStatus | null; refresh: () => void } {
  const [status, setStatus] = useState<AccountStatus | null>(null);

  const refresh = useCallback(() => {
    if (!localStorage.getItem('access_token')) return;
    auth
      .me()
      .then((res) => {
        const me: Me = res.data ?? {};
        setStatus({ email: me.email ?? null, emailVerified: me.emailVerified !== false, mfaEnabled: me.mfaEnabled === true, isAdmin: (me.roles ?? []).some((role) => role.role === 'Admin') });
      })
      .catch(() => setStatus({ email: null, emailVerified: true, mfaEnabled: true, isAdmin: false }));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { status, refresh };
}
