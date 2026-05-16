import { apiClient } from './client';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId: string | null;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CategoryPayload {
  name: string;
  parentId?: string | null;
  status?: 'active' | 'inactive';
}

const BASE = '/api/product/categories';

export const categories = {
  list: () =>
    apiClient.get<Category[]>(BASE),

  get: (id: string) =>
    apiClient.get<Category>(`${BASE}/${id}`),

  create: (payload: CategoryPayload) =>
    apiClient.post<Category>(BASE, payload),

  update: (id: string, payload: Partial<CategoryPayload>) =>
    apiClient.put<Category>(`${BASE}/${id}`, payload),

  delete: (id: string) =>
    apiClient.delete(`${BASE}/${id}`),
};
