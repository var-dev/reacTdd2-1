
import type { AvailableTimeSlot, Service, Stylist } from "./types.js";

type ServiceStylists = Record<Service, readonly Stylist[]>;


export const makeFlat = (
  services: Service[],
  availableTimeSlots: AvailableTimeSlot[],
  serviceStylists: ServiceStylists
): {startsAt: number, stylist: Stylist, service: Service}[] =>
  availableTimeSlots
    .flatMap(({startsAt, stylists})=>stylists.map((stylist)=>({startsAt, stylist})))
    .flatMap(({startsAt, stylist})=>services.map((service)=>{
      return serviceStylists[service]?.some(stylistForService=>stylistForService===stylist)
        ?  {startsAt, stylist, service}
        : null
    }))
    .filter((entry): entry is NonNullable<typeof entry> => !!entry)

export const computeServices = (flatServiceSlotStylist:{service:Service, startsAt:number, stylist: Stylist}[])=>
  [...new Set(flatServiceSlotStylist.map(entry=>entry.service))]

export const computeStylists = (flatServiceSlotStylist:{service:Service, startsAt:number, stylist: Stylist}[])=>
  [...new Set(flatServiceSlotStylist.map(entry=>entry.stylist))]

export const computeStylistsForService = (
  flatServiceSlotStylist:{service:Service, startsAt:number, stylist: Stylist}[],
  selectedService: Service | undefined
)=>
  [...new Set(flatServiceSlotStylist
    .filter(entry=>(selectedService===undefined) || (selectedService===entry.service))
    .map(entry=>entry.stylist))]

export const computeServicesForStylist = (
  flatServiceSlotStylist:{service:Service, startsAt:number, stylist: Stylist}[],
  selectedStylist: Stylist | undefined
)=>
  [...new Set(flatServiceSlotStylist
    .filter(entry=>(selectedStylist===undefined) || (selectedStylist===entry.stylist))
    .map(entry=>entry.service))]

export const timeSlotsForServiceStylist = (
  flatServiceSlotStylist:{service:Service, startsAt:number, stylist: Stylist}[],
  service: Service,
  stylist: Stylist
)=>[...new Set(
  flatServiceSlotStylist
    .filter(entry=>entry.service===service && entry.stylist===stylist)
    .map(entry=>entry.startsAt)
)]

export const pickEarliest = (
  services: Service[],
  availableTimeSlots: AvailableTimeSlot[],
  serviceStylists: ServiceStylists
): {service: Service, stylist: Stylist} | null =>
  availableTimeSlots
    // sort earliest first
    .slice()
    .sort((a, b) => a.startsAt - b.startsAt)

    // expand each time slot into {slot, service}
    .flatMap(slot =>
      services.map(service => ({
        service,
        slot,
        stylist: serviceStylists[service] ?? []
      }))
    )

    // compute intersection of available vs qualified stylists
    .map(entry => ({
      ...entry,
      stylist: entry.slot.stylists.find(s =>
        entry.stylist.includes(s as (typeof entry.stylist)[number])
      )
    }))

    // keep only entries with a matching stylist
    .filter(entry => entry.stylist)

    // pick the earliest (already sorted)
    .map(entry => ({
      service: entry.service,
      stylist: entry.stylist as Stylist
    }))[0] ?? null;

