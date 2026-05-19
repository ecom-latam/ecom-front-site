import { apiClient } from './client';

export interface Address {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  floor: string;
  city: string;
  province: string;
  zip: string;
  isDefault: boolean;
}

export interface AddressPayload {
  label: string;
  fullName: string;
  phone: string;
  address: string;
  floor?: string;
  city: string;
  province: string;
  zip?: string;
}

export const addresses = {
  list:       ()                              => apiClient.get<Address[]>('/api/auth/addresses'),
  create:     (data: AddressPayload)         => apiClient.post<Address>('/api/auth/addresses', data),
  update:     (id: string, data: AddressPayload) => apiClient.put<Address>(`/api/auth/addresses/${id}`, data),
  remove:     (id: string)                   => apiClient.delete(`/api/auth/addresses/${id}`),
  setDefault: (id: string)                   => apiClient.patch<Address>(`/api/auth/addresses/${id}/default`),
};
