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
    salonOpensAt: number,
    salonClosesAt: number,
    appointment: Appointment,
    today: Date
  }

export const AppointmentForm = ({
  selectableServices,
  salonOpensAt,
  salonClosesAt,
  appointment,
  today
}: AppointmentFormType) =>{
  return <form aria-label="Appointment form">
    <label htmlFor="service">Service</label>
    <select name="service" id="service" value={appointment.service} onChange={()=>{}}>
      {selectableServices.map((service: string)=><option key={service}>{service}</option>)}
    </select>
    <TimeSlotTable salonOpensAt={salonOpensAt} salonClosesAt={salonClosesAt} today={today}/>
  </form>
}
AppointmentForm.defaultProps = {
  selectableServices,
  salonOpensAt: 9,
  salonClosesAt: 19,
  today: new Date(1970, 1, 1)
};



const timeIncrements = (
  numberOfTimeSlots: number,
  startTime: number,
  increment: number
) =>
  Array(numberOfTimeSlots)
    .fill([startTime])
    .reduce((acc, _, i) =>
      acc.concat([startTime + i * increment])
    );

const dailyTimeSlots = (
  salonOpensAt: number,
  salonClosesAt: number
) => {
  const totalSlots = (salonClosesAt - salonOpensAt) * 2;
  const startTime = new Date().setHours(salonOpensAt, 0, 0, 0);
  const increment = 30 * 60 * 1000;
  return timeIncrements(
    totalSlots,
    startTime,
    increment
  );
};

const toTimeValue = (timestamp:number) => new Date(timestamp).toTimeString().substring(0, 5);

const weeklyDateValues = (startDate: Date) => {
  const midnight = startDate.setHours(0, 0, 0, 0);
  const increment = 24 * 60 * 60 * 1000;
  return timeIncrements(7, midnight, increment);
};
const toShortDate = (timestamp: number) => {
  const [day, , dayOfMonth] = new Date(timestamp).toDateString().split(" ");
  return `${day} ${dayOfMonth}`;
};

const TimeSlotTable = ({salonOpensAt, salonClosesAt, today}: {salonOpensAt: number, salonClosesAt: number, today: Date})=>{
  const timeSlots = dailyTimeSlots(salonOpensAt, salonClosesAt);
  const dates = weeklyDateValues(today);
  return <table aria-label="time slot table" >
    <thead>
      <tr>
        <th />
        {dates.map((d: number) => (<th key={d}>{toShortDate(d)}</th>))}
      </tr>
    </thead>
    <tbody>
      {timeSlots.map((timeSlot: number) => (
        <tr key={timeSlot}>
          <th>{toTimeValue(timeSlot)}</th>
        </tr>
      ))}
    </tbody>
  </table>
}
