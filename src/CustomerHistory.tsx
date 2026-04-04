import React, { useEffect, useState } from "react";
import { fetchQuery, graphql } from "relay-runtime";
import { getEnvironment } from "./relayEnvironment.js";
import type { Customer } from "./types.js";
export const query = graphql`
  query CustomerHistoryQuery($id: ID!) {
    customer(id: $id) {
      id
      firstName
      lastName
      phoneNumber
      appointments {
        startsAt
        stylist
        service
        notes
      }
    }
  }
`;

type CustomerHistoryProps = {id: number}
export const CustomerHistory = ({ id }: CustomerHistoryProps) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  useEffect(() => {
    const subscription = fetchQuery(getEnvironment(), query, { id }).subscribe({
      next: ({customer}:any) => setCustomer(customer),
      // next: (customer) => console.log(customer),
});
    return () => subscription.unsubscribe();
  }, [id]);
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
      </table>
    </>
  );
};