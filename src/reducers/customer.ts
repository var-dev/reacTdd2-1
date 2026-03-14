import type { Customer } from "../types.js";
type State = {
  customer: Customer;
  status?: "SUBMITTING" | undefined;
  validationErrors?: {};
  error?: boolean ;
}
const defaultState = {
  customer: {},
  status: undefined,
  validationErrors: {},
  error: false,
};
export const reducer = (state:State = defaultState, action: any) => {
  switch (action.type) {
    case "ADD_CUSTOMER_SUBMITTING":
      return { ...state, status: "SUBMITTING" };
    case "ADD_CUSTOMER_SUCCESSFUL":
      return { 
        ...state, 
        status: "SUCCESSFUL", 
        customer: action.customer 
      };
    case "ADD_CUSTOMER_FAILED":
      return { 
        ...state, 
        status: "FAILED",
        error: true
       };
    case "ADD_CUSTOMER_VALIDATION_FAILED":
      return { 
        ...state, 
        status: "VALIDATION_FAILED",
        validationErrors: action.validationErrors
       };
    default:
      return state;
  }
};
