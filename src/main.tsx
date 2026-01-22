import React from "react";
import ReactDOM from "react-dom/client";
import { AppointmentsDayView } from "./appointmentsDayView.js";
import { CustomerForm } from "./customerForm.js";
import { sampleAppointments, sampleAvailableTimeSlots } from "./sampleData.js";
import { 
  AppointmentForm, 
  serviceStylistRecord, 
  selectableServicesList,
  stylists,
type Appointment, 
type AppointmentFormProps } from "./appointmentForm.js";

const appointmentFormProps: AppointmentFormProps = {
  selectableServices: selectableServicesList,
  selectableStylists: stylists,
  serviceStylists: serviceStylistRecord,
  salonOpensAt: 9,
  salonClosesAt: 19,
  availableTimeSlots: sampleAvailableTimeSlots,
  today: new Date(),
  appointment: (sampleAppointments[0]! as Appointment),
  onSave: x=>{console.log(x)}
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
  render(
      <AppointmentForm {...appointmentFormProps}/>
  );

