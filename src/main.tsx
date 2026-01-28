import React from "react";
import ReactDOM from "react-dom/client";
import { AppointmentsDayView } from "./AppointmentsDayView.js";
import { CustomerForm } from "./CustomerForm.js";
import { sampleAppointments, sampleAvailableTimeSlots } from "./sampleData.js";
import { 
  AppointmentForm, 
  serviceStylistRecord, 
  selectableServicesList,
  stylists, 
type AppointmentFormProps } from "./AppointmentForm.js";
import type { AppointmentProps } from "./AppointmentsDayView.js";
import { App } from "./App.js";

const appointmentFormProps: AppointmentFormProps = {
  selectableServices: selectableServicesList,
  selectableStylists: stylists,
  serviceStylists: serviceStylistRecord,
  salonOpensAt: 9,
  salonClosesAt: 19,
  availableTimeSlots: sampleAvailableTimeSlots,
  today: new Date(),
  appointment: (sampleAppointments[0]! as AppointmentProps),
  onSave: ()=>{}
}
ReactDOM.createRoot(
  document.getElementById("root")!
).
  // render(
  //     <AppointmentsDayView appointments={sampleAppointments} />
  // );
  // render(
  //     <CustomerForm customer={sampleAppointments[0]!.customer} onSave={(customer)=>{console.log(customer)}}/>
  // );
  // render(
  //     <AppointmentForm {...appointmentFormProps}/>
  render(
      <App />
  );

