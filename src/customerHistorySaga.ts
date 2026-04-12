import { put, call, takeLatest } from "redux-saga/effects";
import { getCustomerHistoryRequest, getCustomerHistoryRequesting, getCustomerHistorySuccessful,getCustomerHistoryFailed, type CustomerHistory } from "./customerHistorySlice.js";
import type { Customer } from "./types.js";
import type { ValidationErrors } from "./customerFormValidation.js";
import type { CustomerState } from "./customerSlice.js";
import type { GraphQLResult, GraphQLQuery } from "aws-amplify/api";
import { amplifyClient } from "./amplifyClient.js";
import type { PayloadAction } from "@reduxjs/toolkit";

type CustomerId = number

const customerHistoryQuery = /* GraphQL */ `
  query CustomerHistoryQuery($id: ID!) {
    customer(id: $id) {
      id
      firstName
      lastName
      phoneNumber
      appointments {
        startsAt
        stylist
        service
        notes
      }
    }
  }
`;

const fetchCustomerHistory = (customerId: string | number)=> amplifyClient.graphql<GraphQLQuery<{customer:CustomerHistory}>>({
          query: customerHistoryQuery,
          variables: { id: String(customerId) }
        });

export function* getCustomerHistoryWatcher(){
  yield takeLatest(getCustomerHistoryRequest, getCustomerHistorySaga);
} 

export function* getCustomerHistorySaga(action: PayloadAction<CustomerId>) {
  yield put(getCustomerHistoryRequesting());
  const response:GraphQLResult<GraphQLQuery<{customer:CustomerHistory}>> = yield call(fetchCustomerHistory, action.payload) ;
  if("data" in response && response.data.customer){
    yield put(getCustomerHistorySuccessful(response.data.customer));
  } else if("errors" in response) {
    yield put(getCustomerHistoryFailed())
  } else {
    throw Error ("Unknown CustomerHistory response from graphql client")
  }
}