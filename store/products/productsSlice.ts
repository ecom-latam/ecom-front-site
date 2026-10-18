import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Product, ProductListParams } from '@/utils/api/products';

interface ProductsState {
  list: Product[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  list: [],
  total: 0,
  loading: false,
  error: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    fetchProductsRequest: {
      reducer(state) {
        state.loading = true;
        state.error = null;
      },
      prepare(payload: ProductListParams | undefined) {
        return { payload };
      },
    },
    fetchProductsSuccess(state, action: PayloadAction<{ list: Product[]; total: number }>) {
      state.list = action.payload.list;
      state.total = action.payload.total;
      state.loading = false;
    },
    fetchProductsFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { fetchProductsRequest, fetchProductsSuccess, fetchProductsFailure } = productsSlice.actions;
export const productsReducer = productsSlice.reducer;
