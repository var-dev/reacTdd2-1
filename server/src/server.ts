import { buildApp } from "./app.js";
import { generateFakeCustomers } from "./customers.js";
import {
  generateFakeAppointments,
  buildTimeSlots,
} from "./appointments.js";

let port = process.env.PORT || 3000;
let customers = generateFakeCustomers();
let timeSlots = buildTimeSlots();
let appointments = generateFakeAppointments(
  customers,
  timeSlots
);
buildApp(customers, appointments, timeSlots).listen(
  port
);
console.log(`Server listening on port ${port}.`);