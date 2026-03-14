import { configureStore,  } from "@reduxjs/toolkit";
import customerReducer from "./slices/customerSlice.js";

export const store = configureStore({
  reducer: {
    customer: customerReducer,
  },
});