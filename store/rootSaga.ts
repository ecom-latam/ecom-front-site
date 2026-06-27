import { all } from 'redux-saga/effects';
import { sessionSaga } from './session/sessionSaga';
import { cartSaga } from './cart/cartSaga';

export function* rootSaga() {
  yield all([sessionSaga(), cartSaga()]);
}
