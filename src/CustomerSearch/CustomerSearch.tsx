import React, {useEffect, useState, useCallback, type ReactNode} from "react";
import type { Customer } from "../types.js";
import { searchParams } from "../searchParams.js";

type CustomerRowProps = {customer: Customer, renderCustomerActions: (customer: Customer)=>ReactNode}
const CustomerRow = ({ 
  customer,
  renderCustomerActions
}: CustomerRowProps) => (
  <tr>
    <td>{customer.firstName}</td>
    <td>{customer.lastName}</td>
    <td>{customer.phoneNumber}</td>
    <td>{renderCustomerActions(customer)}</td>
    <td />
  </tr>
);

export type CustomerSearchProps = {
  renderCustomerActions: (customer: Customer) => ReactNode
  navigate: (params:URLSearchParams)=>void
  searchTerm?: string | undefined
  limit?: number | undefined
  lastRowIds?: string[] | undefined
}
export const CustomerSearch = ({
  renderCustomerActions = ()=><></>,
  navigate = () => {},
  searchTerm = '',
  limit = 10,
  lastRowIds = [],
}:CustomerSearchProps )=>{
  const [customers, setCustomers] = useState<Customer[] | undefined>(undefined);
  const handleSearchTextChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    // setSearchTerm(event.target.value);
  }
  const fetchData = async () => {
    const after = lastRowIds[lastRowIds.length - 1] ?? '';
    const query = searchParams({after, searchTerm, limit: limit === 10 ? '' : String(limit)});
    const result = await globalThis.fetch(`/customers${query}`, {
        method: "GET",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
      });
    setCustomers(await result.json());
  };
  useEffect(() => {
      fetchData();
    },
    [lastRowIds, searchTerm, limit]);
    return (
      <>
        <input 
          aria-label="Search for customers"
          placeholder="Enter filter text"
          type="text"
          value={searchTerm}
          onChange={handleSearchTextChanged}
        />
        <table aria-label="customer search table">
          <thead>
            <tr>
              <th>First name</th>
              <th>Last name</th>
              <th>Phone number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(customers) 
              ? customers.map((customer: Customer) => (
                  <CustomerRow 
                    key={customer.id} 
                    customer={customer} 
                    renderCustomerActions={renderCustomerActions}
                  />
                ))
              : null}
          </tbody>
        </table>
      </>
  )}