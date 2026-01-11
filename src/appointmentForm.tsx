import React from "react"

const selectableServices = [
    "Cut",
    "Blow-dry",
    "Cut & color",
    "Beard trim",
    "Cut & beard trim",
    "Extensions",
  ] as const
export type Service = typeof selectableServices[number]
export type Appointment = {
  service: Service
}

  type AppointmentFormType = {
    selectableServices: Service[],
    appointment: Appointment
  }

export const AppointmentForm = ({
  selectableServices,
  appointment
}: AppointmentFormType) =>{
  return <form aria-label="Appointment form">
    <label htmlFor="service">Service</label>
    <select name="service" id="service" value={appointment.service} onChange={()=>{}}>
      {selectableServices.map((service: string)=><option key={service}>{service}</option>)}
    </select>
  </form>
}
AppointmentForm.defaultProps = {
  selectableServices
};

