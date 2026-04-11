import { all, fork } from "redux-saga/effects";
import { addCustomerWatcher } from "./customerSaga.js";
import { getCustomerHistoryWatcher } from "./customerHistorySaga.js";

export function* rootSaga() {
  yield all([
    fork(addCustomerWatcher),
    fork(getCustomerHistoryWatcher),
  ])
}
