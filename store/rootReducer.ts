import { combineReducers } from '@reduxjs/toolkit';
import { sessionReducer } from './session/sessionSlice';
import { cartReducer } from './cart/cartSlice';

export const rootReducer = combineReducers({
  session: sessionReducer,
  cart: cartReducer,
});
