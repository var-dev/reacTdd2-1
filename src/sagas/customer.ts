import { put, call } from "redux-saga/effects";
import { addCustomerSubmitting } from "../slices/customerSlice.js";


const fetchPost = (url: string, data: any) =>{
  return globalThis.fetch(url, {
    method: "POST",
  });
}
const customer = {
    name: "John Doe",
    email: "john.doe@example.com"
  };
export function* addCustomer() {
  // Simulate API call success
  yield put(addCustomerSubmitting());
  yield call(fetchPost, "/customers", customer) ;
}