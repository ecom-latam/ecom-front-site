import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { triggerErrorModal } from '@/lib/errorModal';
import { getErrorDefinition } from '@/lib/errors';

declare module 'axios' {
  interface AxiosRequestConfig {
    _skipModal?: boolean;
  }
}

const BFF_URL = process.env.NEXT_PUBLIC_BFF_URL ?? 'http://localhost:4000';

function getSlugFromHost(): string {
  if (typeof window === 'undefined') return '';
  const host = window.location.hostname;
  const prod = host.match(/^([^.]+)\.ecom\.com$/);
  if (prod) return prod[1];
  const dev = host.match(/^([^.]+)\.localhost$/);
  if (dev) return dev[1];
  return '';
}

export const apiClient = axios.create({
  baseURL: BFF_URL,
  withCredentials: true,
});

let isRefreshing = false;
type RefreshCallback = (token: string) => void;
let refreshQueue: RefreshCallback[] = [];

apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const slug = getSlugFromHost();
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  if (slug) config.headers['X-Tenant-Slug'] = slug;
  return config;
});

const AUTH_ENDPOINTS = ['/api/auth/login', '/api/auth/refresh', '/api/auth/customer/register', '/api/auth/mfa/verify', '/api/auth/password/change'];

apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const url: string = original?.url ?? '';
    const isAuthEndpoint = AUTH_ENDPOINTS.some((e) => url.includes(e));

    if (err.response?.status !== 401 || original._retry || isAuthEndpoint) {
      if (!original?._skipModal) {
        const code: string = err.response?.data?.error?.code
          ?? (typeof err.response?.data?.error === 'string' ? err.response.data.error : null)
          ?? 'INTERNAL_ERROR';
        triggerErrorModal(getErrorDefinition(code));
      }
      return Promise.reject(err);
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token: string) => {
          original.headers['Authorization'] = `Bearer ${token}`;
          resolve(apiClient(original));
        });
      });
    }

    isRefreshing = true;
    try {
      const { data } = await axios.post(
        `${BFF_URL}/api/auth/refresh`,
        {},
        { withCredentials: true }
      );
      const newToken: string = data.accessToken;
      localStorage.setItem('access_token', newToken);
      refreshQueue.forEach((cb) => cb(newToken));
      refreshQueue = [];
      original.headers['Authorization'] = `Bearer ${newToken}`;
      return apiClient(original);
    } catch {
      endSession();
      window.location.href = '/iniciar-sesion';
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export function startSession(token: string) {
  localStorage.setItem('access_token', token);
  document.cookie = '_auth=1; path=/; max-age=2592000';
}

export function endSession() {
  localStorage.removeItem('access_token');
  document.cookie = '_auth=; path=/; max-age=0';
}
