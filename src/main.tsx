import React from "react";
import ReactDOM from "react-dom/client";
import { AppointmentsDayView } from "./appointmentsDayView.js";
import { CustomerForm } from "./customerForm.js";
import { sampleAppointments, sampleAvailableTimeSlots } from "./sampleData.js";
import { 
  AppointmentForm, 
  serviceStylists, 
  selectableServicesList,
  stylists,
type Appointment, 
type AppointmentFormProps } from "./appointmentForm.js";

const appointmentFormProps: AppointmentFormProps = {
  selectableServices: selectableServicesList,
  selectableStylists: stylists,
  serviceStylists,
  salonOpensAt: 9,
  salonClosesAt: 19,
  availableTimeSlots: sampleAvailableTimeSlots,
  today: new Date(),
  appointment: (sampleAppointments[0]! as Appointment),
  onSubmit: x=>{console.log(x)}
}
ReactDOM.createRoot(
  document.getElementById("root")!
).
  // render(
  //     <AppointmentsDayView appointments={sampleAppointments} />
  // );
  // render(
  //     <CustomerForm customer={sampleAppointments[0]!.customer} onSubmit={(customer)=>{console.log(customer.phoneNumber)}}/>
  // );
  render(
      <AppointmentForm {...appointmentFormProps}/>
  );

