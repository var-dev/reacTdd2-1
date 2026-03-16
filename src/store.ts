import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { takeLatest } from "redux-saga/effects";

import { addCustomer } from "./sagas/customer.js";
import customerReducer, { addCustomerRequest, addCustomerSubmitting } from "./slices/customerSlice.js";

export function* rootSaga() {
  yield takeLatest(addCustomerRequest.type, addCustomer);
}

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    customer: customerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

