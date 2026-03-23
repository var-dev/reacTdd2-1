import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux";
import type { Customer } from "./types.js";
import { required, list, match, anyErrors, hasError, type ValidatorName, type Validators, validateMany, type ValidationErrors } from "./customerFormValidation.js";
import { addCustomerRequest } from "./customerSlice.js";
import { navigateRequest } from "./navigationSlice.js";
import type { AppDispatch, RootState } from "./store.js";

const useAppSelector = useSelector.withTypes<RootState>()
const useAppDispatch = useDispatch.withTypes<AppDispatch>()

type ErrorProps = {hasError:boolean}
const Error = ({hasError}: ErrorProps) => (
  <p role="alert" >{hasError ? 'An error occurred during save.' : ''}</p>
);  

export type CustomerFormProps = {
  customer?: Customer | undefined
}
export const CustomerForm = ({ customer }: CustomerFormProps) => {
  const dispatch = useAppDispatch();
  const {
    error,
    status,
    validationErrors: serverValidationErrors,
  } = useAppSelector(({ customer }) => customer);
  const [customerState, setCustomerState] = useState<Customer>(customer ?? { firstName: "" });
  const [validationErrors, setValidationErrors] = useState({} as ValidationErrors);

  useEffect(()=> {
    if (status === "SUCCESSFUL") {
    dispatch(navigateRequest(`/addAppointment?customerId=${customerState.id}`))
    } else if (status === "VALIDATION_FAILED") {
      setValidationErrors(serverValidationErrors! );
    }
  }, [status])

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
    dispatch(addCustomerRequest(customerState));
  }
  const handleChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerState((customerState) => ({ ...customerState, [target.name]: target.value}))
    if (validators.hasOwnProperty(target.name)) {
      const validationResult = validateMany(validators, {[target.name]: target.value});
      setValidationErrors({
        ...validationErrors,
        ...validationResult
      });
    }
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
  const RenderError = ({fieldName}: {fieldName: ValidatorName}) => {
    const allValidationErrors = {
      ...validationErrors,
      ...serverValidationErrors
  };
  return (
    <span id={`${fieldName}Error`} role="alert">
      {hasError(fieldName, allValidationErrors) ? allValidationErrors[fieldName] : ""}
    </span>
  )}
  
  return <form onSubmit = {handleSubmit} aria-label="Customer form">
    <Error hasError={error ?? false} />
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
    <RenderError fieldName="firstName"/>

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
    <RenderError fieldName="lastName"/>

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
    <RenderError fieldName="phoneNumber"/>
    <input 
      disabled={status === "SUCCESSFUL"}
      type="submit" 
      value="Add" 
    />
    {status === "SUBMITTING" ? (<span className="submittingIndicator" aria-label="Submitting Indicator"/>) : null}
  </form>
}

