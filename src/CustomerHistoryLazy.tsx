import React, { type FC } from "react";
import { useLazyLoadQuery } from "react-relay";
import type { CustomerHistoryQuery, CustomerHistoryQuery$data } from "./__generated__/CustomerHistoryQuery.graphql.js";
import CustomerHistoryQueryDocument from "./__generated__/CustomerHistoryQuery.graphql.js";

export type Customer = NonNullable<CustomerHistoryQuery$data['customer']>
export type Appointment = NonNullable<Customer['appointments']>[number]

const toTimeString = (startsAt:number|string) =>
  new Date(Number(startsAt)).toString().substring(0, 21);
const AppointmentRow = ({ appointment }: { appointment: Appointment }) => (
  <tr>
    <td>{toTimeString(appointment?.startsAt as number|string)}</td>
    <td>{appointment?.stylist}</td>
    <td>{appointment?.service}</td>
    <td>{appointment?.notes}</td>
  </tr>
);

export const CustomerHistory:FC<{id:string}> = ({ id }) => {
  const {customer} = useLazyLoadQuery<CustomerHistoryQuery>(CustomerHistoryQueryDocument, { id })
  if (!customer) return (<p>Customer not found</p>)
  return (
    <>
      <h2>
        {customer?.firstName} {customer?.lastName} 
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
          {customer?.appointments?.filter(appointment => appointment != null).map(
            (appointment) => (
              <AppointmentRow
                key={appointment.startsAt}
                appointment={appointment}
              />
            )
          )}
        </tbody>
      </table>
    </>
  );
};