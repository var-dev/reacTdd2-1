import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.js";

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

