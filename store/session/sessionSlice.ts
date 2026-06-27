import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface BuyerSession {
  id: string;
  email: string;
  name?: string;
}

interface SessionState {
  user: BuyerSession | null;
  loading: boolean;
  error: string | null;
}

const initialState: SessionState = {
  user: null,
  loading: false,
  error: null,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    fetchSessionRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchSessionSuccess(state, action: PayloadAction<BuyerSession>) {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchSessionFailure(state, action: PayloadAction<string>) {
      state.user = null;
      state.loading = false;
      state.error = action.payload;
    },
    clearSession(state) {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  fetchSessionRequest,
  fetchSessionSuccess,
  fetchSessionFailure,
  clearSession,
} = sessionSlice.actions;

export const sessionReducer = sessionSlice.reducer;
