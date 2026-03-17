import { put, call, takeLatest } from "redux-saga/effects";
import { addCustomerSubmitting, addCustomerRequest } from "./customerSlice.js";


const fetchPost = (url: string, data: any) =>{
  return globalThis.fetch(url, {
    method: "POST",
  });
}
const customer = {
    name: "John Doe",
    email: "john.doe@example.com"
  };

export function* addCustomerWatcher(){
  yield takeLatest(addCustomerRequest.type, addCustomer);
} 

export function* addCustomer() {
  // Simulate API call success
  yield put(addCustomerSubmitting());
  yield call(fetchPost, "/customers", customer) ;
}