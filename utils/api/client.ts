import axios from 'axios';

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

apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const slug = getSlugFromHost();
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  if (slug) config.headers['X-Tenant-Slug'] = slug;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;
      try {
        const { data } = await axios.post(
          `${BFF_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = (data as { accessToken: string }).accessToken;
        localStorage.setItem('access_token', newToken);
        err.config.headers['Authorization'] = `Bearer ${newToken}`;
        return apiClient(err.config);
      } catch {
        endSession();
        window.location.href = '/iniciar-sesion';
      }
    }
    return Promise.reject(err);
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
