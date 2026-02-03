import React, { useState } from "react"
import type { Customer, CustomerWithId } from "./types.js";
import { required, list, match, anyErrors, hasError, type ValidatorName, type Validators, validateMany, type ValidationErrors } from "./customerFormValidation.js";
type ErrorProps = {hasError:boolean}
const Error = ({hasError}: ErrorProps) => (
  <p role="alert" >{hasError ? 'An error occurred during save.' : ''}</p>
);  
export type CustomerFormProps = {
  customer?: Customer | undefined
  onSave: (customer: Customer)=>void
}
export const CustomerForm = (
  {
    customer, 
    onSave
  }: CustomerFormProps) =>{
  const [customerState, setCustomerState] = useState<Customer>(customer ?? {firstName: ""});
  const [error, setError] = useState(false);
  const [validationErrors, setValidationErrors] = useState({} as ValidationErrors);

  const validators = {
    firstName: required("First name is required"),
    lastName: required("Last name is required"),
    phoneNumber: 
      list(
        required("Phone Number is required"), 
        match(/^[0-9+()\- ]*$/, 'Only numbers, spaces and these symbols are allowed: ( ) + -')
      ),
  } satisfies Validators;
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault() 
    const validationResult = validateMany(validators, customerState);
    if (anyErrors(validationResult)) {
      setValidationErrors(validationResult);
      return
    }

    const result = await globalThis.fetch("/customers", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customerState),
    });
    if(result?.ok){
      setError(false);
      const customerWithId = await result.json();
      onSave(customerWithId);
    } else {
      setError(true);
    }
  }
  const handleChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerState((customerState) => ({ ...customerState, [target.name]: target.value}))
  }
  const handleBlur = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    if (validators.hasOwnProperty(target.name)) {
      const validationResult = validateMany(validators, {[target.name]: target.value});
      setValidationErrors({
        ...validationErrors,
        ...validationResult
      });
    }
  };
  
  const renderError = (fieldName: keyof Validators) => {
    return <span id={`${fieldName}Error`} role="alert">
      {hasError(fieldName, validationErrors) ? (validationErrors as any)[fieldName] : ""}
    </span>;
  }
  
  return <form onSubmit = {handleSubmit} aria-label="Customer form">
    <Error hasError={error} />
    <label htmlFor="firstName">First Name</label>
    <input 
      type="text" 
      name="firstName" 
      id="firstName" 
      value={customerState.firstName} 
      onChange={handleChange}
      onBlur={handleBlur}
      aria-describedby="firstNameError"
      />
    {renderError("firstName")}

    <label htmlFor="lastName">Last Name</label>
    <input 
      type="text" 
      name="lastName" 
      id="lastName" 
      value={customerState.lastName} 
      onChange={handleChange}
      onBlur={handleBlur}
      aria-describedby="lastNameError"
      />
    {renderError("lastName")}

    <label htmlFor="phoneNumber">Phone Number</label>
    <input 
      type="text" 
      name="phoneNumber" 
      id="phoneNumber" 
      value={customerState.phoneNumber} 
      onChange={handleChange}
      onBlur={handleBlur}
      aria-describedby="phoneNumberError"
      />
    {renderError("phoneNumber")}
    <input type="submit" value="Add" />
  </form>
}

