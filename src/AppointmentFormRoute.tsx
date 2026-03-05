import React from "react";
import { useParams, useSearchParams } from "react-router";
import { AppointmentFormLoader, type AppointmentFormLoaderProps } from "./AppointmentFormLoader.js";
import { blankAppointment } from "./sampleDataStatic.js";

export const AppointmentFormRoute = (props: AppointmentFormLoaderProps) => {
  const [params, _] = useSearchParams()
  const customerId = (params.get("customerId") ?? '').length>0 ? { customerId: parseInt(params.get("customerId")!) } : {}
  return (
    <AppointmentFormLoader {...props} appointment={{...blankAppointment, ...customerId }}/>
  );
};