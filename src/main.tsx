import React from "react";
import ReactDOM from "react-dom/client";
import { AppointmentsDayView } from "./appointmentsDayView.js";
import { CustomerForm } from "./customerForm.js";
import { sampleAppointments } from "./sampleData.js";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  // <AppointmentsDayView
  //   appointments={sampleAppointments}
  // />
  <CustomerForm customer={sampleAppointments[0]!.customer} onSubmit={(customer)=>{console.log(customer.phoneNumber)}}/>
);

