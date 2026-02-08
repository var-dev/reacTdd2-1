import { serviceStylists } from "./sampleDataStatic.js"
export type CustomerWithId = {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  stylist: string;
  service: string;
  notes: string;
};
export type Customer = Partial<CustomerWithId>
export type ServiceStylistRecord = typeof serviceStylists
export type Service = keyof ServiceStylistRecord;
export type Stylist = RealStylist | "noOne"
export type RealStylist = ServiceStylistRecord[keyof ServiceStylistRecord][number]
export type AvailableTimeSlot = {
    startsAt: number;
    stylists: Stylist[];
}
export type Appointment = {
    customer: number;
    startsAt: number;
    stylist: Stylist;
    service: Service;
}
