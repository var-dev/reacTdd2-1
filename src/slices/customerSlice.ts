import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Customer } from '../types.js';

interface CustomerState {
  status?: 'SUBMITTING' | 'SUCCESSFUL' | 'FAILED' | 'VALIDATION_FAILED';
  validationErrors?: {};
  error?: boolean;
}

const initialState: CustomerState & Customer= {
  
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    addCustomerSubmitting: (state: CustomerState) => {
      state.status = 'SUBMITTING';
    },
    addCustomerSuccessful: (state: CustomerState & Customer, action: PayloadAction<{ customer: Customer }>) => {
      state.status = 'SUCCESSFUL';
      Object.assign(state, action.payload.customer)
    },
    addCustomerFailed: (state: CustomerState) => {
      state.status = 'FAILED';
      state.error = true;
    },
    addCustomerValidationFailed: (state: CustomerState, action: PayloadAction<{ validationErrors: {} }>) => {
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