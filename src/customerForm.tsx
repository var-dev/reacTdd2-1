import React, { useState } from "react"
import type { Customer } from "./appointmentsDayView.js"

type ErrorProps = {hasError:boolean}
const Error = ({hasError}: ErrorProps) => (
  <p role="alert" >{hasError ? 'An error occurred during save.' : ''}</p>
);

export type CustomerFormProps = {
  customer?: Customer
  onSave: (customer: Customer)=>void
}
export const CustomerForm = (
  {
    customer, 
    onSave
  }: CustomerFormProps) =>{
  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault() 

      const result = await globalThis.fetch("/customers", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerState),
      });
      if(result?.ok){
        const customerWithId = await result.json();
        onSave(customerWithId);
      } else {
        setError(true);
      }
  }
  const [customerState, setCustomerState] = useState<Customer>(customer ?? {firstName: ""});
  const [error, setError] = useState(false);
  const handleChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerState((customerState) => ({ ...customerState, [target.name]: target.value}))
  }

  
  return <form onSubmit = {onSubmitHandler} aria-label="Customer form">
    <Error hasError={error} />
    <label htmlFor="firstName">First Name</label>
    <input type="text" name="firstName" id="firstName" value={customerState.firstName} onChange={handleChange}/>
    <label htmlFor="lastName">Last Name</label>
    <input type="text" name="lastName" id="lastName" value={customerState.lastName} onChange={handleChange}/>
    <label htmlFor="phoneNumber">Phone Number</label>
    <input type="text" name="phoneNumber" id="phoneNumber" value={customerState.phoneNumber} onChange={handleChange}/>
    <input type="submit" value="Add" />
  </form>
}