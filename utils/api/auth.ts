import { apiClient } from './client';
import type { AxiosRequestConfig } from 'axios';

export interface InviteInfo {
  storeId: string;
  role: string;
}

export const auth = {
  login: (email: string, password: string, config?: AxiosRequestConfig) =>
    apiClient.post('/api/auth/login', { email, password }, config),

  mfaVerify: (mfaToken: string, code: string, config?: AxiosRequestConfig) =>
    apiClient.post('/api/auth/mfa/verify', { code }, { ...config, headers: { Authorization: `Bearer ${mfaToken}` } }),

  mfaRecover: (mfaToken: string, config?: AxiosRequestConfig) =>
    apiClient.post('/api/auth/mfa/recover', {}, { ...config, headers: { Authorization: `Bearer ${mfaToken}` } }),

  mfaRecoverConfirm: (token: string, config?: AxiosRequestConfig) =>
    apiClient.post('/api/auth/mfa/recover/confirm', { token }, config),

  registrationStatus: () =>
    apiClient.get<{ merchant: boolean; customer: boolean }>('/api/auth/registration-status'),

  registerCustomer: (email: string, password: string, config?: AxiosRequestConfig) =>
    apiClient.post('/api/auth/customer/register', { email, password }, config),

  forgotPassword: (email: string, config?: AxiosRequestConfig) =>
    apiClient.post('/api/auth/password/forgot', { email }, config),

  resetPassword: (token: string, newPassword: string, config?: AxiosRequestConfig) =>
    apiClient.post('/api/auth/password/reset', { token, newPassword }, config),

  logout: () =>
    apiClient.post('/api/auth/logout', {}),

  getInvitation: (token: string, config?: AxiosRequestConfig) =>
    apiClient.get<InviteInfo>(`/api/auth/invitations/${token}`, config),

  acceptInvitation: (token: string, body: { email: string; password: string }, config?: AxiosRequestConfig) =>
    apiClient.post<{ userId: string; email: string }>(`/api/auth/invitations/${token}/accept`, body, config),
};
