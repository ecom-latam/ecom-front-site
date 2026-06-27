import { apiClient } from './client';

export const pageInfo = {
  // Client-side variant of lib/api/storeClient.ts#getPageInfo.
  // Used in client components that need page/store data fetched from the browser.
  // The server-side version (with React.cache) is not available in client components
  // because it relies on next/headers.
  getPublic: <T = Record<string, unknown>>() =>
    apiClient.get<T>('/api/page/public'),
};
