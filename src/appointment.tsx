export function Appointment({customer}: {customer: {firstName: string}}){
  return <div>{customer.firstName}</div>
}

const appointmentTimeOfDay = (startsAt:number)=>{
  const [h,m] = new Date(startsAt).toTimeString().split(':')
  return `${h}:${m}`
}

export function AppointmentsDayView({appointments}:any) {
  return <div id="appointmentsDayView">
    <ol> 
      {appointments.map((appointment:any) => (
        <li key={appointment.startsAt}>
          {appointmentTimeOfDay(appointment.startsAt)}
        </li>
      ))}
    </ol>
  </div>
}