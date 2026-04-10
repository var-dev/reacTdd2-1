import React, { useEffect, useState } from "react";
import { amplifyClient } from "./amplifyClient.js";
import type { AppointmentApi } from "./types.js";

type Customer = {
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  appointments?: Array<AppointmentApi | null> | null;
};

type CustomerHistoryData = {
  customer?: Customer | null;
};


const toTimeString = (startsAt: number | string | undefined) =>
  startsAt === undefined ? "" : new Date(Number(startsAt)).toString().substring(0, 21);

const AppointmentRow = ({ appointment }: { appointment: AppointmentApi }) => (
  <tr>
    <td>{toTimeString(appointment.startsAt)}</td>
    <td>{appointment?.stylist}</td>
    <td>{appointment?.service}</td>
    <td>{appointment?.notes}</td>
  </tr>
);

type CustomerHistoryProps = { customer: Customer}
export const CustomerHistory = ({ customer}: CustomerHistoryProps) => {

  return (
    <>
      <h2>
        {("firstName" in customer) ? customer.firstName : 'not found'} {("lastName" in customer) ? customer.lastName : 'not found'} 
      </h2>
      <p>
        {customer?.phoneNumber}
      </p>
      <h3>
        Booked Appointments
      </h3>
      <table>
        <thead>
          <tr>
            <th>When</th>
            <th>Stylist</th>
            <th>Service</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {customer?.appointments?.filter((appointment): appointment is AppointmentApi => appointment != null).map(
            (appointment, index) => (
              <AppointmentRow
                key={String(appointment.startsAt ?? index)}
                appointment={appointment}
              />
            )
          )}
        </tbody>
      </table>
    </>
  );
};
