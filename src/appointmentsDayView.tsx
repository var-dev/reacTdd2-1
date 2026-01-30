import { useState } from "react"
import type { Customer } from "./types.js"
export type AppointmentProps = {
    startsAt?: number
    customer?: Customer
    stylist?: string
    service?: string
    notes?: string
}

export function Appointment({customer, stylist, service, notes, startsAt}: AppointmentProps){
  return (
    <div>
      <h2>Today's appointment at {appointmentTimeOfDay(startsAt!)}</h2>
      <table>
      <tbody>
        <tr>
          <th>First name</th>
          <td>{customer!.firstName ?? ''}</td>
        </tr>
        <tr>
          <th>Last name</th>
          <td>{customer!.lastName ?? ''}</td>
        </tr>
        <tr>
          <th>Phone</th>
          <td>{customer!.phoneNumber ?? ''}</td>
        </tr>
        <tr>
          <th>Stylist</th>
          <td>{stylist ?? ''}</td>
        </tr>
        <tr>
          <th>Service</th>
          <td>{service ?? ''}</td>
        </tr>
        <tr>
          <th>Notes</th>
          <td>{notes ?? ''}</td>
        </tr>
      </tbody>
    </table>
  </div>
  )
}

const appointmentTimeOfDay = (startsAt:number)=>{
  const [h,m] = new Date(startsAt).toTimeString().split(':')
  return `${h}:${m}`
}

export function AppointmentsDayView({appointments}:{appointments: AppointmentProps[]}) {
  const [selectedAppointment, setSelectedAppointment] = useState(0)
  return <div id="appointmentsDayView">
    <ol> 
      {appointments.map((appointment: AppointmentProps, index) => (
        <li key={appointment.startsAt}>
          <button 
            type="button"
            onClick={ handleClick(index)}
            >
            {appointmentTimeOfDay(appointment.startsAt!)}
          </button>
        </li>
      ))}
    </ol>
    {appointments.length === 0 
      ? (<p>There are no appointments scheduled for today</p>)
      : (<Appointment {...appointments[selectedAppointment]!} />)
    }
  </div>

  function handleClick(index: number) {
    return () => setSelectedAppointment(index)
  }
}