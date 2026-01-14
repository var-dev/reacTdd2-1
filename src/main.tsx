import React from "react";
import ReactDOM from "react-dom/client";
import { AppointmentsDayView } from "./appointmentsDayView.js";
import { CustomerForm } from "./customerForm.js";
import { sampleAppointments, sampleAvailableTimeSlots } from "./sampleData.js";
import { AppointmentForm, type AppointmentFormProps } from "./appointmentForm.js";

const appointmentFormProps: AppointmentFormProps = {
  selectableServices: ["Cut", "Blow-dry"],
  salonOpensAt: 9,
  salonClosesAt: 19,
  availableTimeSlots: sampleAvailableTimeSlots,
  today: new Date(),
  appointment: {},
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

