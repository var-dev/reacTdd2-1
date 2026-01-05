import type { AppointmentObj } from "./appointmentsDayView.js";

const today = new Date();
const at = (hours: number) => today.setHours(hours, 0);
export const sampleAppointments: AppointmentObj[] = [
  { startsAt: at(12), customer: { firstName: "Ashley", lastName: "Doe", phoneNumber: "000000000000", stylist: "Mary", service: "cut", notes: "notes QWE" } },
  { startsAt: at(13), customer: { firstName: "Jordan", lastName: "Smith", phoneNumber: "000000000001", stylist: "Larry", service: "trim", notes: "notes ASD"  } },
];