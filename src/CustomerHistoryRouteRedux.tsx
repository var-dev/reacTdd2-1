import React, {useState, useEffect} from "react";
import { useSearchParams } from "react-router";
import { CustomerHistory } from "./CustomerHistoryAmplify.js";
import { amplifyClient } from "./amplifyClient.js";

import type { AppointmentApi } from "./types.js";
import { useAppDispatch, useAppSelector } from "./hooks.js";
import { getCustomerHistoryRequest } from "./customerHistorySlice.js";

type CustomerHistory = {
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  appointments?: Array<AppointmentApi | null> | null;
};


export const CustomerHistoryRoute = () => {
  const [params, _] = useSearchParams()
  const customerId = (params.get("customer") ?? '').length>0 ? parseInt(params.get("customer")!)  : NaN
  const dispatch = useAppDispatch()
  const customerHistory = useAppSelector(({customerHistory})=>customerHistory)
    useEffect(()=>{
      dispatch(getCustomerHistoryRequest(customerId))
    }, [ ])

  if (customerHistory.status === "REQUESTING") {
    return <p role="alert">Loading</p>;
  }
  if (customerHistory.status === "FAILED") {
    return (
      <p role="alert">
        Sorry, an error occurred while pulling data from the server.
      </p>
    );
  }
  if (!customerHistory.firstName && !customerHistory.lastName) {
    return <p role="alert">Customer not found</p>;
  }
  return (
    <CustomerHistory customer={customerHistory}/>
  );
};