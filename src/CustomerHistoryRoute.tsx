import React from "react";
import { useSearchParams } from "react-router";
import { CustomerHistory } from "./CustomerHistoryAmplify.js";

export type AppointmentFormRouteProps = {
  today: Date
  onSave: ()=>void
}
export const CustomerHistoryRoute = () => {
  const [params, _] = useSearchParams()
  const customer = (params.get("customer") ?? '').length>0 ? parseInt(params.get("customer")!)  : NaN
  return (
    <CustomerHistory id={customer}/>
  );
};