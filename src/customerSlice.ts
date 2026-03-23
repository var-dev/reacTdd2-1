import { createSlice, createAction, type PayloadAction } from '@reduxjs/toolkit';
import type { Customer } from './types.js';
import type { ValidationErrors } from './customerFormValidation.js';

export const addCustomerRequest = createAction<Customer>('customer/addCustomerRequest');

export type CustomerState = {
  status?: 'SUBMITTING' | 'SUCCESSFUL' | 'FAILED' | 'VALIDATION_FAILED';
  validationErrors?: ValidationErrors;
  error?: boolean;
}

const initialState: CustomerState & Customer= {};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    addCustomerSubmitting: (state: CustomerState) => {
      state.status = 'SUBMITTING';
    },
    addCustomerSuccessful: (state: CustomerState & Customer, action: PayloadAction<{ customer: Customer }>) => {
      state.status = 'SUCCESSFUL';
      state.error = false;
      Object.assign(state, action.payload.customer)
    },
    addCustomerFailed: (state: CustomerState) => {
      state.status = 'FAILED';
      state.error = true;
    },
    addCustomerValidationFailed: (state: CustomerState, action: PayloadAction<{ validationErrors: ValidationErrors }>) => {
      state.status = 'VALIDATION_FAILED';
      state.validationErrors = action.payload.validationErrors;
    },
  },
});

export const {
  addCustomerSubmitting,
  addCustomerSuccessful,
  addCustomerFailed,
  addCustomerValidationFailed,
} = customerSlice.actions;

export default customerSlice.reducer;