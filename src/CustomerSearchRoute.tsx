import React, {type ReactNode} from "react";
import type { Customer } from "./types.js";
import { useParams, useSearchParams } from "react-router";
import { CustomerSearch, type CustomerSearchProps } from "./CustomerSearch/CustomerSearch.js";
import { convertParams } from "./searchParams.js";

type CustomerSearchRouteProps = {
  renderCustomerActions: (customer: Customer) => ReactNode;
}

export const CustomerSearchRoute = ({
  renderCustomerActions
}: CustomerSearchRouteProps) => {
  const [params, setParams] = useSearchParams();
  return (
    <CustomerSearch renderCustomerActions={renderCustomerActions} navigate={setParams} setParams={setParams} {...convertParams(params)}/>
  );
};

