import React from "react"

export const AppointmentForm = ({
  selectableServices
}: any) =>{
  return <form aria-label="Appointment form">
    <label htmlFor="service">Service</label>
    <select name="service" id="service">
      {selectableServices.map((service: string)=><option key={service}>{service}</option>)}
    </select>
  </form>
}
AppointmentForm.defaultProps = {
  selectableServices: [
    "Cut",
    "Blow-dry",
    "Cut & color",
    "Beard trim",
    "Cut & beard trim",
    "Extensions",
  ]
};