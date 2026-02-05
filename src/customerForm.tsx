import React, { useState } from "react"
import type { Customer, CustomerWithId } from "./types.js";
import { required, list, match, anyErrors, hasError, type ValidatorName, type Validators, validateMany, type ValidationErrors } from "./customerFormValidation.js";

type ErrorProps = {hasError:boolean}
const Error = ({hasError}: ErrorProps) => (
  <p role="alert" >{hasError ? 'An error occurred during save.' : ''}</p>
);  

type RenderErrorProps = {fieldName: ValidatorName, errors: ValidationErrors}
const RenderError = ({fieldName, errors}: RenderErrorProps) => (
  <span id={`${fieldName}Error`} role="alert">
    {hasError(fieldName, errors) ? errors[fieldName] : ""}
  </span>
)
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
  const [submitting, setSubmitting] = useState(false);
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

  const doSave = async () => {
    setSubmitting(true);
    const result = await globalThis.fetch("/customers", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customerState),
    }).finally(() => { setSubmitting(false) });

    if (result?.ok) {
      setError(false);
      const customerWithId = await result.json();
      onSave(customerWithId);
    } else if (result.status === 422) {
      const response = await result.json();
      setValidationErrors(response.errors);
    } else {
      setError(true);
    }
  }
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault() 
    const validationResult = validateMany(validators, customerState);
    if (anyErrors(validationResult)) {
      setValidationErrors(validationResult);
      return
    }
    await doSave();

    
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
    <RenderError fieldName="firstName" errors={validationErrors}/>

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
    <RenderError fieldName="lastName" errors={validationErrors}/>

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
    <RenderError fieldName="phoneNumber" errors={validationErrors}/>
    <input type="submit" value="Add" />
    {submitting ? (<span className="submittingIndicator" aria-label="Submitting Indicator"/>) : null}
  </form>
}

