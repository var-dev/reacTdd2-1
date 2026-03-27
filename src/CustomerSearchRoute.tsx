import React, {useEffect, useState, type ReactNode} from "react";
import { useSearchParams, Link, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import type { Customer } from "./types.js";
import { searchParams, commaStringPop, commaStringPush} from "./searchParams.js";
import type { AppDispatch } from "./store.js";
import { navigateRequest } from "./navigationSlice.js";


const useAppDispatch = useDispatch.withTypes<AppDispatch>()

type SearchButtonsProps = {
  customers: Customer[]
}
const SearchButtons = (
  {
    customers,
  }: SearchButtonsProps) => 
  { 
    // const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const [params, setParams] = useSearchParams()
    const pageLimit= parseInt(params.get('limit') ?? '10')
    const disabledNext=Array.isArray(customers) ? customers.length < pageLimit : true
    const disabledPrevious = (params.get('lastRowIds') ?? '').length === 0
    const previousPageParams = ()=>{
      const paramsClone = new URLSearchParams(params)
      const [prevLastRowIds, _] = commaStringPop(params.get('lastRowIds'))
      paramsClone.set('lastRowIds', prevLastRowIds)
      return paramsClone.toString()
    }
    const nextPageParams = ()=>{
      const paramsClone = new URLSearchParams(params)
      if (!Array.isArray(customers) || customers.length === 0) return paramsClone.toString();
      const currentLastRowId = customers[customers.length - 1]!.id!;
      paramsClone.set('lastRowIds', commaStringPush(params.get('lastRowIds'), String(currentLastRowId)))
      return paramsClone.toString()
    }
    const handlePageLimit = (event: React.ChangeEvent<HTMLInputElement>) => {
      const paramsClone = new URLSearchParams(params)
      paramsClone.set('limit', event.target.value ?? 10)
      // navigate(`/searchCustomers?${paramsClone.toString()}`)
      dispatch(navigateRequest(`/searchCustomers?${paramsClone.toString()}`))
    }
    return (<menu>
    <li>
      <Link 
        aria-label="Go to previous page"
        to={`/searchCustomers?${previousPageParams()}`}
        className={disabledPrevious ? 'disabled' : ''}
      >Previous</Link >
    </li>
    <li>
      <Link 
        aria-label="Go to next page"
        to={`/searchCustomers?${nextPageParams()}`}
        className={disabledNext ? 'disabled' : ''}
      >Next</Link >
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
)};

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
  const handleSearchTextChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    params.set('searchTerm', event.target.value)
    setParams(params)
  }
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
        customers={customers!}
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
