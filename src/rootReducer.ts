import customerReducer from "./customerSlice.js";
import navigationReducer from './navigationSlice.js'
import customerHistoryReducer from './customerHistorySlice.js'


export const rootReducer = {
  customer: customerReducer,
  navigation: navigationReducer,
  customerHistory: customerHistoryReducer
}