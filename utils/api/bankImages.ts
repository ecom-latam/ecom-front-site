import { apiClient } from './client';

export interface BankImage {
  _id: string;
  url: string;
  publicId: string;
  name: string;
  alt: string;
}

export interface BankImageListResponse {
  data: BankImage[];
  total: number;
  page: number;
  limit: number;
}

const BASE = '/api/page/images';

// El banco de imagenes del sitio vive en ecom-page: las imagenes de un producto se eligen de ahi, no se suben aca.
export const bankImages = {
  list: (params: { q: string; page: number; limit?: number }) =>
    apiClient.get<BankImageListResponse>(BASE, {
      params: { folderId: 'all', sort: 'newest', q: params.q || undefined, page: params.page, limit: params.limit ?? 24 },
    }),
};
