import { apiClient } from './client';

export interface StoreConfigResponse {
  transfer_info?: string;
}

export const storeConfig = {
  get: () =>
    apiClient.get<StoreConfigResponse>('/api/store/store/config'),
};
