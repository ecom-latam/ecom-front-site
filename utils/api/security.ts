import { apiClient } from '@/utils/api';

export const security = {
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post('/api/auth/password/change', { currentPassword, newPassword }),
};
