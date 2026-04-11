import { createSlice, createAction, type PayloadAction } from '@reduxjs/toolkit';
import type { AppointmentApi } from "./types.js";
import type { PrepareAction } from '@reduxjs/toolkit';
export type CustomerHistory = {
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  appointments?: Array<AppointmentApi | null> | null;
};
type CustomerId = number
export const getCustomerHistoryRequest = createAction<PrepareAction<CustomerId>>(
  'customerHistory/getCustomerHistoryRequest', 
  (customerId:CustomerId)=>({payload: customerId})
);

export type CustomerHistoryState = {
  status?: 'REQUESTING' | 'SUCCESSFUL' | 'FAILED' ;
  error?: boolean;
}

const initialState: CustomerHistoryState & CustomerHistory = {};

const customerHistorySlice = createSlice({
  name: 'customerHistory',
  initialState,
  reducers: {
    getCustomerHistoryRequesting: (state: CustomerHistoryState) => {
      state.status = 'REQUESTING';
    },
    getCustomerHistorySuccessful: (state: CustomerHistoryState & CustomerHistory, action: PayloadAction<CustomerHistory>) => {
      Object.assign(state, action.payload)
      state.status = 'SUCCESSFUL';
      state.error = false;
    },
    getCustomerHistoryFailed: (state: CustomerHistoryState) => {
      state.status = 'FAILED';
      state.error = true;
    },
  },
});

export const {
  getCustomerHistoryRequesting,
  getCustomerHistorySuccessful,
  getCustomerHistoryFailed,
} = customerHistorySlice.actions;

export default customerHistorySlice.reducer;