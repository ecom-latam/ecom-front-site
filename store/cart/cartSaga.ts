import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { apiDelete, apiGet, apiPost } from '@/utils/api/http';
import type { CartItem } from '@/lib/cart/types';
import {
  fetchCartRequest,
  fetchCartSuccess,
  fetchCartFailure,
  addCartItemRequest,
  removeCartItemRequest,
} from './cartSlice';
import type { PayloadAction } from '@reduxjs/toolkit';

interface CartResponse {
  items: CartItem[];
}

function* handleFetchCart() {
  try {
    const cart: CartResponse = yield call(apiGet<CartResponse>, '/api/cart');
    yield put(fetchCartSuccess(cart.items ?? []));
  } catch {
    yield put(fetchCartFailure('Failed to fetch cart'));
  }
}

function* handleAddCartItem(action: PayloadAction<CartItem>) {
  try {
    yield call(apiPost, '/api/cart/items', action.payload);
  } catch {
    // optimistic update already applied in reducer; saga handles the remote sync
  }
}

function* handleRemoveCartItem(action: PayloadAction<{ productId: string; variantId?: string | null }>) {
  try {
    yield call(apiDelete, `/api/cart/items/${action.payload.productId}`);
  } catch {
    // optimistic update already applied in reducer; saga handles the remote sync
  }
}

export function* cartSaga() {
  yield takeLatest(fetchCartRequest.type, handleFetchCart);
  yield takeEvery(addCartItemRequest.type, handleAddCartItem);
  yield takeEvery(removeCartItemRequest.type, handleRemoveCartItem);
}
