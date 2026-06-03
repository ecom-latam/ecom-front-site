import { apiClient } from './client';

export interface PreferenceItem {
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
}

export interface CreatePreferencePayload {
  items: PreferenceItem[];
  back_urls: { success: string; failure: string; pending: string };
  external_reference?: string;
}

export interface PreferenceResponse {
  init_point: string;
  preference_id: string;
}

export const payment = {
  createPreference: (payload: CreatePreferencePayload) =>
    apiClient.post<PreferenceResponse>('/api/payment/preference', payload),
};
