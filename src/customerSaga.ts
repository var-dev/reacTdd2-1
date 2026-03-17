import { put, call, takeLatest } from "redux-saga/effects";
import { addCustomerSubmitting, addCustomerRequest } from "./customerSlice.js";
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

export function* addCustomer({
  payload
}:{payload: Customer}) {
  // Simulate API call success
  yield put(addCustomerSubmitting());
  yield call(fetchPost, "/customers", payload) ;
}