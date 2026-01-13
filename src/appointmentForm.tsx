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

export type AppointmentFormProps = {
  selectableServices: Service[],
  salonOpensAt: number,
  salonClosesAt: number,
  appointment: Appointment,
  availableTimeSlots: {startsAt: number}[]
  today: Date
}

export const AppointmentForm = ({
  selectableServices,
  salonOpensAt,
  salonClosesAt,
  appointment,
  availableTimeSlots,
  today
}: AppointmentFormProps) =>{
  return <form aria-label="Appointment form">
    <label htmlFor="service">Service</label>
    <select name="service" id="service" value={appointment.service} onChange={()=>{}}>
      {selectableServices.map((service: string)=><option key={service}>{service}</option>)}
    </select>
    <TimeSlotTable salonOpensAt={salonOpensAt} salonClosesAt={salonClosesAt} today={today} availableTimeSlots={availableTimeSlots}/>
  </form>
}
AppointmentForm.defaultProps = {
  selectableServices,
  salonOpensAt: 9,
  salonClosesAt: 19,
  availableTimeSlots: [],
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
const mergeDateAndTime = (date: number, timeSlot: number) => {
  const time = new Date(timeSlot);
  return new Date(date).setHours(
    time.getHours(),
    time.getMinutes(),
    time.getSeconds(),
    time.getMilliseconds()
  );
};

type RadioButtonIfAvailableProps = {availableTimeSlots: {startsAt: number}[], date: number, timeSlot: number}
const RadioButtonIfAvailable = ({availableTimeSlots, date, timeSlot}: RadioButtonIfAvailableProps) =>{
  const startsAt = mergeDateAndTime(date, timeSlot);
  if (availableTimeSlots.some(
    (availableTimeSlot: { startsAt: number }) =>
      availableTimeSlot.startsAt === startsAt
    )) 
     return <input type="radio" name="startsAt" aria-label={String(startsAt)} value={startsAt}/>
    return null
}

type TimeSlotTableProps = {salonOpensAt: number, salonClosesAt: number, today: Date, availableTimeSlots: {startsAt: number}[]}
const TimeSlotTable = ({salonOpensAt, salonClosesAt, today, availableTimeSlots}: TimeSlotTableProps)=>{
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
          {dates.map((date: number) => (
            <td key={date}>
              <RadioButtonIfAvailable availableTimeSlots={availableTimeSlots} date={date} timeSlot={timeSlot} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
}
