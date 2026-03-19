import { put, call, takeLatest } from "redux-saga/effects";
import { addCustomerSubmitting, addCustomerRequest, addCustomerFailed, addCustomerSuccessful, addCustomerValidationFailed } from "./customerSlice.js";
import type { Customer } from "./types.js";


const fetchPost = (url: string, data: any) =>{
  return globalThis.fetch(url, {
    body: JSON.stringify(data),
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" }
  });
}


export function* addCustomerWatcher(){
  yield takeLatest(addCustomerRequest, addCustomer);
} 

export function* addCustomer({payload}:{payload: Customer}) {
  yield put(addCustomerSubmitting());
  const result:Response = yield call(fetchPost, "/customers", payload) ;
  if(result.ok){
    const customer: Customer = yield call([result, result.json]);
    yield put(addCustomerSuccessful({customer}));
  } else if (result.status === 422) {
    const response: unknown = yield call([result, result.json]);
    yield put(addCustomerValidationFailed({validationErrors: response as {}}))
  } else {
    yield put(addCustomerFailed())
  }
}