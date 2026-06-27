import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '@/lib/cart/types';

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  total: number;
}

function calcTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
  total: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    fetchCartRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCartSuccess(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
      state.total = calcTotal(action.payload);
      state.loading = false;
      state.error = null;
    },
    fetchCartFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    addCartItemRequest(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find(
        (i) => i.productId === action.payload.productId && i.variantId === action.payload.variantId
      );
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.total = calcTotal(state.items);
    },
    removeCartItemRequest(state, action: PayloadAction<{ productId: string; variantId?: string | null }>) {
      state.items = state.items.filter(
        (i) =>
          i.productId !== action.payload.productId ||
          i.variantId !== (action.payload.variantId ?? null)
      );
      state.total = calcTotal(state.items);
    },
    clearCart(state) {
      state.items = [];
      state.total = 0;
      state.error = null;
    },
  },
});

export const {
  fetchCartRequest,
  fetchCartSuccess,
  fetchCartFailure,
  addCartItemRequest,
  removeCartItemRequest,
  clearCart,
} = cartSlice.actions;

export const cartReducer = cartSlice.reducer;
