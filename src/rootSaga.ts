import { all, fork } from "redux-saga/effects";
import { addCustomerWatcher } from "./customerSaga.js";

export function* rootSaga() {
  yield all([
    fork(addCustomerWatcher)
  ])
}
