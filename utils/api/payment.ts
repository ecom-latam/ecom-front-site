import { apiClient } from './client';
import type { ShippingMethod } from './orders';

export interface CreateMpPreferencePayload {
  shippingAddress: {
    fullName: string;
    phone: string;
    address?: string;
    city?: string;
    province?: string;
    zip?: string;
  };
  shippingMethod: ShippingMethod;
  notes?: string;
  // Origen de la tienda para construir las back_urls del retorno de Checkout Pro.
  storeOrigin: string;
}

export interface CreateMpPreferenceResponse {
  orderId: string;
  preferenceId: string;
  initPoint: string;
}

export const payment = {
  // Checkout Pro: crea la orden + la preferencia de pago y devuelve el init_point
  // al que se redirige al comprador. El cobro lo confirma el webhook de MP.
  createMpPreference: (payload: CreateMpPreferencePayload) =>
    apiClient.post<CreateMpPreferenceResponse>('/api/mp/create-preference', payload),
};
