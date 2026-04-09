import React, { useEffect, useState } from "react";
import { amplifyClient } from "./amplifyClient.js";
import type { AppointmentApi } from "./types.js";

type CustomerHistoryCustomer = {
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  appointments?: Array<AppointmentApi | null> | null;
};

type CustomerHistoryData = {
  customer?: CustomerHistoryCustomer | null;
};

const customerHistoryQuery = /* GraphQL */ `
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

type CustomerHistoryProps = {id: number}
export const CustomerHistory = ({ id }: CustomerHistoryProps) => {
  const [customer, setCustomer] = useState<CustomerHistoryCustomer | null>(null);
  const [status, setStatus] = useState<"loading" | "loaded" | "failed">("loading");

  useEffect(() => {
    let isCancelled = false;
    setStatus("loading");

    const fetchCustomer = async () => {
      try {
        const response = await amplifyClient.graphql({
          query: customerHistoryQuery,
          variables: { id: String(id) }
        });

        if (isCancelled) {
          return;
        }

        if ("errors" in response && response.errors && response.errors.length > 0) {
          setStatus("failed");
          return;
        }

        const data = ("data" in response ? response.data : null) as CustomerHistoryData | null;
        setCustomer(data?.customer ?? null);
        setStatus("loaded");
      } catch {
        if (!isCancelled) {
          setStatus("failed");
        }
      }
    };

    void fetchCustomer();
    return () => {
      isCancelled = true;
    };
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
