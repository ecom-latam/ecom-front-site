import { apiClient } from './client';
import type { AxiosRequestConfig } from 'axios';

export const auth = {
  login: (email: string, password: string, config?: AxiosRequestConfig) =>
    apiClient.post('/api/auth/login', { email, password }, config),

  mfaVerify: (mfaToken: string, code: string, config?: AxiosRequestConfig) =>
    apiClient.post('/api/auth/mfa/verify', { mfaToken, code }, config),

  registerCustomer: (email: string, password: string, config?: AxiosRequestConfig) =>
    apiClient.post('/api/auth/customer/register', { email, password }, config),

  logout: () =>
    apiClient.post('/api/auth/logout', {}),
};
