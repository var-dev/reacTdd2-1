import React, {useState, useEffect} from "react";
import { useSearchParams } from "react-router";
import { CustomerHistory } from "./CustomerHistoryAmplify.js";
import { amplifyClient } from "./amplifyClient.js";

import type { AppointmentApi } from "./types.js";

type CustomerHistory = {
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  appointments?: Array<AppointmentApi | null> | null;
};

type CustomerHistoryData = {
  customer?: CustomerHistory | null;
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


export type AppointmentFormRouteProps = {
  today: Date
  onSave: ()=>void
}
export const CustomerHistoryRoute = () => {
  const [params, _] = useSearchParams()
  const customerId = (params.get("customer") ?? '').length>0 ? parseInt(params.get("customer")!)  : NaN
  const [customer, setCustomer] = useState<CustomerHistory | null>(null);
  const [status, setStatus] = useState<"loading" | "loaded" | "failed">("loading");
  useEffect(() => {
    let isCancelled = false;
    setStatus("loading");

    const fetchCustomer = async () => {
      try {
        const response = await amplifyClient.graphql({
          query: customerHistoryQuery,
          variables: { id: String(customerId) }
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
  }, [customerId]);

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
  if (!customer) {
    return <p role="alert">Customer not found</p>;
  }
  return (
    <CustomerHistory customer={customer}/>
  );
};