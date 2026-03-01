import React, {useEffect, useState, useCallback, type ReactNode} from "react";
import { useSearchParams } from "react-router";
import type { Customer } from "./types.js";
import { searchParams, commaStringPop, commaStringPush} from "./searchParams.js";

type SearchButtonsProps = {
  handleNext: ()=>void
  disabledNext: boolean
  handlePrevious: ()=>void
  disabledPrevious: boolean
  handlePageLimit: (event: React.ChangeEvent<HTMLInputElement>)=>void
  pageLimit: number
}
const SearchButtons = ({handleNext, disabledNext, handlePrevious, disabledPrevious, handlePageLimit, pageLimit}: SearchButtonsProps) => (
  <menu>
    <li>
      <button 
        type="button"
        onClick={handlePrevious}
        disabled={disabledPrevious}
      >Previous</button >
    </li>
    <li>
      <button 
        type="button"
        onClick={handleNext}
        disabled={disabledNext}
      >Next</button >
    </li>
    <li>
      <input
        aria-label="Records per page"
        type="number"
        onChange={handlePageLimit}
        placeholder="Enter page limit" 
        value={pageLimit} 
      /> 
    </li>
  </menu>
);

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

export type CustomerSearchRouteProps = {renderCustomerActions: (customer: Customer) => ReactNode}
export const CustomerSearchRoute = ({
  renderCustomerActions = ()=><></>
  }:CustomerSearchRouteProps )=>{
  
  const [customers, setCustomers] = useState<Customer[] | undefined>(undefined);
  const [params, setParams] = useSearchParams();
  const handlePageLimit = (event: React.ChangeEvent<HTMLInputElement>) => {
    params.set('limit', event.target.value ?? 10)
    setParams(params)
  }
  const handleSearchTextChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    params.set('searchTerm', event.target.value)
    setParams(params)
  }
  const handleNext = useCallback(async () => {
    if (!Array.isArray(customers) || customers.length === 0) return;
    const currentLastRowId = customers[customers.length - 1]!.id!;
    params.set('lastRowIds', commaStringPush(params.get('lastRowIds'), String(currentLastRowId)))
    setParams(params)
  }, [customers, params]);
  const handlePrevious = useCallback(async () => {
    const [prevLastRowIds, _] = commaStringPop(params.get('lastRowIds'))
    params.set('lastRowIds', prevLastRowIds)
    setParams(params)
  }, [params]);

  const fetchData = async () => {
    const [, after] = commaStringPop(params.get('lastRowIds'))
    const query = searchParams({after, searchTerm: params.get('searchTerm') ?? '', limit: params.get('limit') ?? '' });
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
  }, [params]);
  return (
    <>
      <input 
        aria-label="Search for customers"
        placeholder="Enter filter text"
        type="text"
        value={params.get('searchTerm') ?? ''}
        onChange={handleSearchTextChanged}
      />
      <SearchButtons 
        handleNext={handleNext} 
        disabledNext={Array.isArray(customers) ? customers.length < parseInt(params.get('limit') ?? '10') : true}
        handlePrevious={handlePrevious}
        disabledPrevious={(params.get('lastRowIds') ?? '').length === 0}
        handlePageLimit={handlePageLimit}
        pageLimit={parseInt(params.get('limit') ?? '10')}
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





// import React, {type ReactNode} from "react";
// import type { Customer } from "./types.js";
// import { useSearchParams } from "react-router";
// import { CustomerSearch, type CustomerSearchProps } from "./CustomerSearch/CustomerSearch.js";
// import { convertParams } from "./searchParams.js";

// type CustomerSearchRouteProps = {
//   renderCustomerActions: (customer: Customer) => ReactNode;
// }

// export const CustomerSearchRoute = ({
//   renderCustomerActions
// }: CustomerSearchRouteProps) => {
//   const [params, setParams] = useSearchParams();
//   return (
//     <CustomerSearch renderCustomerActions={renderCustomerActions} navigate={setParams} setParams={setParams} {...convertParams(params)}/>
//   );
// };

