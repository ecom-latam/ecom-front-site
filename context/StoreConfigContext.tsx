'use client';

import { createContext, useContext } from 'react';

export interface ComponentsPresets {
  button?: string;
  input?: string;
  select?: string;
  textarea?: string;
  navbar?: string;
  product_card?: string;
  view_toggle?: string;
}

export interface StoreConfig {
  components_presets?: ComponentsPresets;
  product_detail_layout?: string;
  cart_layout?: string;
  search_preset?: string;
}

export const StoreConfigContext = createContext<StoreConfig>({});

export function useStoreConfig(): StoreConfig {
  return useContext(StoreConfigContext);
}
