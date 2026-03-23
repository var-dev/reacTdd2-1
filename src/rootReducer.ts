import customerReducer from "./customerSlice.js";
import navigationReducer from './navigationSlice.js'


export const rootReducer = {
  customer: customerReducer,
  navigation: navigationReducer,
}