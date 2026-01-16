import React, { useState, useCallback, useRef, useEffect } from "react"

const stylists = ["Ashley", "Jo", "Pat", "Sam"] as const
type Stylist = typeof stylists[number] | "noOne"
const selectableServicesList = [
    "Cut",
    "Blow-dry",
    "Cut & color",
    "Beard trim",
    "Cut & beard trim",
    "Extensions",
  ] as const
export type Service = typeof selectableServicesList[number] 
type ServiceStylistRecord = Record<Service, Stylist[]>

export const serviceStylists: ServiceStylistRecord = {
    "Cut":          ["Ashley", "Jo", "Pat", "Sam"],
    "Blow-dry":     ["Ashley", "Jo", "Pat", "Sam"],
    "Cut & color":  ["Ashley", "Jo"],
    "Beard trim":   ["Pat", "Sam"],
    "Cut & beard trim": ["Pat", "Sam"],
    "Extensions":   ["Ashley", "Pat"],
  }
export type AvailableTimeSlot = {
    startsAt: number;
    stylists: Stylist[];
}
export type Appointment = {
  service?: Service,
  startsAt?: number,
  stylist?: string
} 

export type AppointmentFormProps = {
  selectableServices: Service[],
  selectableStylists: Stylist[],
  serviceStylists: ServiceStylistRecord,
  salonOpensAt: number,
  salonClosesAt: number,
  appointment: Appointment,
  availableTimeSlots: AvailableTimeSlot[],
  today: Date
  onSubmit: (appointment: Appointment)=>void
}

export const AppointmentForm = ({
  selectableServices,
  selectableStylists,
  serviceStylists,
  salonOpensAt,
  salonClosesAt,
  appointment,
  availableTimeSlots,
  today,
  onSubmit,
}: AppointmentFormProps) =>{
  const [appointmentState, setAppointmentState] = useState<Appointment>(appointment)
  const serviceRef = useRef<HTMLSelectElement>(null)
  const stylistRef = useRef<HTMLSelectElement>(null)

  const handleSubmit = (event: React.FormEvent) => {
      event.preventDefault();
      onSubmit(appointmentState);
      };
  const handleStartsAtChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) =>
      setAppointmentState((appointmentState: Appointment) => ({
        ...appointmentState,
        startsAt: parseInt(value),
      })),
    []
  );
  const handleChange = 
    ({ target: { name, value } }: React.ChangeEvent<HTMLSelectElement>) =>
      setAppointmentState((appointmentState: Appointment) => ({
        ...appointmentState,
        [name]: value
      } as Appointment))

  useEffect(() => {
    if (!appointmentState.service) {
      setAppointmentState((appointmentState: Appointment) => ({
        ...appointmentState,
        service: serviceRef.current!.value ?? ''
      } as Appointment))
    }
  }, [])
  useEffect(() => {
    if (!appointmentState.stylist) {
      setAppointmentState((appointmentState: Appointment) => ({
        ...appointmentState,
        stylist: stylistRef.current!.value ?? ''
      } as Appointment))
    }
  }, [])


  const stylistsForService = appointmentState.service
    ? serviceStylists[appointmentState.service]
    : selectableStylists;

  const stylistAvailableTimeSlots = availableTimeSlots.map(
    (timeSlot: AvailableTimeSlot): AvailableTimeSlot => {
      if (
        timeSlot.stylists.some((stylist) => stylist === appointmentState.stylist)
      ) { 
        return timeSlot; 
      }
      return { stylists: ["noOne"], startsAt: -1 };
    }
  );


  return <form aria-label="Appointment form" onSubmit={handleSubmit}>
    <label htmlFor="service">Service</label>
    <select name="service" id="service" value={appointmentState.service} onChange={handleChange} ref={serviceRef}>
      {selectableServices.map((service: string)=><option key={service}>{service}</option>)}
    </select>
    <label htmlFor="stylist">Stylist</label>
    <select name="stylist" id="stylist" value={appointmentState.stylist} onChange={handleChange} ref={stylistRef}>
      {stylistsForService.map((stylist: string)=><option key={stylist}>{stylist}</option>)}
    </select>
    
    <TimeSlotTable salonOpensAt={salonOpensAt} salonClosesAt={salonClosesAt} today={today} availableTimeSlots={stylistAvailableTimeSlots} checkedTimeSlot={appointmentState.startsAt!} handleChange={handleStartsAtChange}/>
   
    <input type="submit" value="Add" aria-label="Submit"/>
  </form>
}
AppointmentForm.defaultProps = {
  selectableServices: selectableServicesList,
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

type RadioButtonIfAvailableProps = {availableTimeSlots: AvailableTimeSlot[], date: number, timeSlot: number, checkedTimeSlot: number, handleChange: ({ target: { value } }: React.ChangeEvent<HTMLInputElement>)=>void}
const RadioButtonIfAvailable = ({availableTimeSlots, date, timeSlot, checkedTimeSlot, handleChange}: RadioButtonIfAvailableProps) =>{
  const startsAt = mergeDateAndTime(date, timeSlot);
  const checkAvailableTimeSlots: boolean = availableTimeSlots.some((availableTimeSlot: AvailableTimeSlot) => availableTimeSlot.startsAt === startsAt)
  if (checkAvailableTimeSlots) 
    return (
      <input 
        type="radio" 
        name="startsAt" 
        aria-label={String(startsAt)} 
        value={startsAt} 
        checked={startsAt === checkedTimeSlot} 
        onChange={handleChange}
      />)
  return null
}

type TimeSlotTableProps = {salonOpensAt: number, salonClosesAt: number, today: Date, availableTimeSlots: AvailableTimeSlot[], checkedTimeSlot: number, handleChange: ({ target: { value } }: React.ChangeEvent<HTMLInputElement>)=>void}
const TimeSlotTable = ({salonOpensAt, salonClosesAt, today, availableTimeSlots, checkedTimeSlot, handleChange}: TimeSlotTableProps)=>{
  const timeSlots = dailyTimeSlots(salonOpensAt, salonClosesAt);
  const dates = weeklyDateValues(today);
  return <table id="time-slots" aria-label="timeSlotTable">
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
              <RadioButtonIfAvailable availableTimeSlots={availableTimeSlots} date={date} timeSlot={timeSlot} checkedTimeSlot={checkedTimeSlot} handleChange={handleChange}/>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
}
