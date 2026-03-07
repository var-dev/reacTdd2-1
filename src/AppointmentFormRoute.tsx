import React from "react";
import { useParams, useSearchParams } from "react-router";
import { AppointmentFormLoader, type AppointmentFormLoaderProps } from "./AppointmentFormLoader.js";

export type AppointmentFormRouteProps = {
  today: Date
  onSave: ()=>void
}
export const AppointmentFormRoute = (props: AppointmentFormRouteProps) => {
  const [params, _] = useSearchParams()
  const customerId = (params.get("customerId") ?? '').length>0 ? parseInt(params.get("customerId")!)  : NaN
  return (
    <AppointmentFormLoader {...props} customerId={customerId}/>
  );
};