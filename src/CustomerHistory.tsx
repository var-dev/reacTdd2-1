import React, { useEffect, useState } from "react";
import { fetchQuery } from "relay-runtime";
import { getEnvironment } from "./relayEnvironment.js";
import type { AppointmentApi } from "./types.js";
import type { CustomerHistoryQuery } from "./CustomerHistoryQuery.graphql.js";
import CustomerHistoryQueryDocument from "./CustomerHistoryQuery.graphql.js";

type AppointmentType = NonNullable<NonNullable<CustomerHistoryQuery['response']['customer']>['appointments']>[0];

const toTimeString = (startsAt:number|string) =>
  new Date(Number(startsAt)).toString().substring(0, 21);
const AppointmentRow = ({ appointment }: { appointment: AppointmentType }) => (
  <tr>
    <td>{toTimeString(appointment?.startsAt as number|string)}</td>
    <td>{appointment?.stylist}</td> 
    <td>{appointment?.service}</td>
    <td>{appointment?.notes}</td>
  </tr>
);

type CustomerHistoryProps = {id: number}
export const CustomerHistory = ({ id }: CustomerHistoryProps) => {
  const [customer, setCustomer] = useState<CustomerHistoryQuery['response']['customer']>(null);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    const subscription = fetchQuery(getEnvironment(), CustomerHistoryQueryDocument, { id }).subscribe({
      next: (data: CustomerHistoryQuery['response']) => {
        setCustomer(data.customer);
        setStatus("loaded");
      },
      error: () => {
        setStatus("failed")
      },
      complete: () => { },
      closed: false
    });
    return () => subscription.unsubscribe();
  }, [id]);
  if (status === "loading") {
    return <p role="alert">Loading</p>;
  }
  if (status === "failed") {
    return (
      <p role="alert">
        Sorry, an error occurred while pulling data from the server.
      </p>
    );
  }
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