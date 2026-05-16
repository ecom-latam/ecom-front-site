import { apiClient } from './client';

export const auth = {
  login: (email: string, password: string) =>
    apiClient.post('/api/auth/login', { email, password }),

  mfaVerify: (mfaToken: string, code: string) =>
    apiClient.post('/api/auth/mfa/verify', { mfaToken, code }),

  registerCustomer: (email: string, password: string) =>
    apiClient.post('/api/auth/customer/register', { email, password }),

  logout: () =>
    apiClient.post('/api/auth/logout', {}),
};
