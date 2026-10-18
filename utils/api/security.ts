import { apiClient } from '@/utils/api';

// El error se muestra en la propia pantalla: no se abre además el modal general.
export const security = {
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post('/api/auth/password/change', { currentPassword, newPassword }, { _skipModal: true }),
};
