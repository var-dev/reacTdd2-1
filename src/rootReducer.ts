import customerReducer, { addCustomerSubmitting } from "./customerSlice.js";


export const rootReducer = {
  customer: customerReducer,
}