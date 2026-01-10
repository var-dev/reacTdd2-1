import React, { useState } from "react"
import type { Customer } from "./appointmentsDayView.js"
export type CustomerFormProps = {
  customer?: Customer
  onSubmit?: (customer: Customer)=>void
}
export const CustomerForm = ({customer, onSubmit}: CustomerFormProps) =>{
  function onSubmitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault() 
    if (onSubmit) {
      return onSubmit(customerState)
    }
  }
  const handleChangeFirstName = ({ target }: React.ChangeEvent<HTMLInputElement>) =>
    setCustomerState((customerState) => ({
      ...customerState,
      firstName: target.value
    }));
  const [customerState, setCustomerState] = useState<Customer>(customer ?? {firstName: ""});

  
  return <form onSubmit = {onSubmitHandler} aria-label="Customer form">
    <label htmlFor="firstName">First Name</label>
    <input type="text" name="firstName" id="firstName" value={customerState.firstName} onChange={handleChangeFirstName}/>
    <input type="submit" value="Add" />
  </form>
}