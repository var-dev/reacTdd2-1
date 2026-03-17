import { takeLatest, all, fork } from "redux-saga/effects";
import { addCustomer, addCustomerWatcher } from "./customerSaga.js";
import { addCustomerRequest } from "./customerSlice.js";


export function* rootSaga() {
  yield all([
    fork(addCustomerWatcher)
  ])
}
