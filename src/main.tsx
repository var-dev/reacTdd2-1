import React from "react";
import ReactDOM from "react-dom/client";
import { AppointmentsDayView } from "./appointmentsDayView.js";
import { CustomerForm } from "./customerForm.js";
import { sampleAppointments, sampleAvailableTimeSlots } from "./sampleData.js";
import { AppointmentForm, serviceStylists, type Appointment, type AppointmentFormProps } from "./appointmentForm.js";

const appointmentFormProps: AppointmentFormProps = {
  selectableServices: ["Cut","Blow-dry","Cut & color","Beard trim","Cut & beard trim","Extensions"],
  selectableStylists: ["Ashley", "Jo", "Pat", "Sam"],
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

