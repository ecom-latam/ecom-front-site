import { call, put, takeLatest } from 'redux-saga/effects';
import { apiGet } from '@/utils/api/http';
import {
  fetchSessionRequest,
  fetchSessionSuccess,
  fetchSessionFailure,
} from './sessionSlice';

interface BuyerSession {
  id: string;
  email: string;
  name?: string;
}

function* handleFetchSession() {
  try {
    const user: BuyerSession = yield call(apiGet<BuyerSession>, '/api/auth/me');
    yield put(fetchSessionSuccess(user));
  } catch {
    yield put(fetchSessionFailure('Failed to fetch session'));
  }
}

export function* sessionSaga() {
  yield takeLatest(fetchSessionRequest.type, handleFetchSession);
}
