import type { AppointmentObj, Customer } from "./AppointmentsDayView.js";
import { type Service, type Stylist } from "./AppointmentForm.js";

const today = new Date();
const at = (hours: number) => today.setHours(hours, 0);

export const serviceStylists = 
  {
    "Cut":          ["Ashley", "Jo", "Pat", "Sam"],
    "Blow-dry":     ["Ashley", "Jo", "Pat", "Sam"],
    "Cut & color":  ["Ashley", "Jo"],
    "Beard trim":   ["Pat", "Sam"],
    "Cut & beard trim": ["Pat", "Sam"],
    "Extensions":   ["Ashley", "Pat"],
  } as const

export const selectableServicesList = Object.keys(serviceStylists) as Service[]
export const stylists = Array.from(new Set(Object.values(serviceStylists).flatMap((stylist)=>stylist))) as Stylist[]


export const sampleAppointmentsShort: AppointmentObj[] = [
  { startsAt: at(12), customer: { firstName: "Ashley", lastName: "Doe", phoneNumber: "000000000000"}, stylist: "Mary", service: "cut", notes: "notes QWE" } ,
  { startsAt: at(13), customer: { firstName: "Jordan", lastName: "Smith", phoneNumber: "000000000001"}, stylist: "Larry", service: "trim", notes: "notes ASD"  } ,
];

export const blankCustomer:Customer = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
};

export const sampleAvailableTimeSlots = [
  { startsAt: 1768698000000, stylists: [] },
  { startsAt: 1768413600000, stylists: ["Jo", "Jo"] },
  { startsAt: 1768926600000, stylists: [] },
  { startsAt: 1768847400000, stylists: ["Jo", "Pat"] },
  { startsAt: 1768518000000, stylists: ["Ashley", "Ashley", "Jo"] },
  { startsAt: 1768498200000, stylists: [] },
  { startsAt: 1768939200000, stylists: ["Sam", "Pat"] },
  { startsAt: 1768782600000, stylists: ["Pat"] },
  { startsAt: 1768420800000, stylists: [] },
  { startsAt: 1768613400000, stylists: ["Pat"] },
  { startsAt: 1768768200000, stylists: ["Jo", "Jo"] },
  { startsAt: 1768842000000, stylists: [] },
  { startsAt: 1768942800000, stylists: ["Jo", "Ashley"] },
  { startsAt: 1768869000000, stylists: ["Ashley", "Ashley"] },
  { startsAt: 1768764600000, stylists: [] },
  { startsAt: 1768770000000, stylists: [] },
  { startsAt: 1768422600000, stylists: [] },
  { startsAt: 1768600800000, stylists: ["Jo", "Ashley"] },
  { startsAt: 1768588200000, stylists: ["Jo", "Ashley", "Pat"] },
  { startsAt: 1768946400000, stylists: ["Jo", "Sam", "Jo"] },
  { startsAt: 1768926600000, stylists: [] },
  { startsAt: 1768501800000, stylists: ["Sam", "Jo"] },
  { startsAt: 1768946400000, stylists: ["Jo", "Sam", "Jo"] },
  { startsAt: 1768842000000, stylists: [] },
  { startsAt: 1768419000000, stylists: [] },
  { startsAt: 1768690800000, stylists: ["Jo"] },
  { startsAt: 1768519800000, stylists: ["Jo"] },
  { startsAt: 1768851000000, stylists: ["Pat", "Pat"] },
  { startsAt: 1768764600000, stylists: [] },
  { startsAt: 1768955400000, stylists: ["Sam", "Ashley", "Sam"] },
  { startsAt: 1768608000000, stylists: [] },
  { startsAt: 1768764600000, stylists: [] },
  { startsAt: 1768948200000, stylists: ["Sam", "Pat"] },
  { startsAt: 1768609800000, stylists: ["Jo", "Ashley"] },
  { startsAt: 1768518000000, stylists: ["Ashley", "Ashley", "Jo"] },
  { startsAt: 1768847400000, stylists: ["Jo", "Pat"] },
  { startsAt: 1768779000000, stylists: [] },
  { startsAt: 1768676400000, stylists: ["Pat", "Jo"] },
  { startsAt: 1768413600000, stylists: ["Jo", "Jo"] },
  { startsAt: 1768773600000, stylists: [] },
  { startsAt: 1768411800000, stylists: ["Jo", "Sam"] },
  { startsAt: 1768755600000, stylists: ["Pat", "Ashley", "Ashley"] },
  { startsAt: 1768865400000, stylists: ["Jo"] },
  { startsAt: 1768851000000, stylists: ["Pat", "Pat"] },
  { startsAt: 1768599000000, stylists: ["Jo", "Ashley"] },
  { startsAt: 1768942800000, stylists: ["Jo", "Ashley"] },
  { startsAt: 1768867200000, stylists: [] },
  { startsAt: 1768843800000, stylists: ["Ashley", "Ashley", "Sam"] },
  { startsAt: 1768669200000, stylists: ["Sam", "Ashley", "Jo"] },
  { startsAt: 1768437000000, stylists: [] },
];
export const sampleAppointments: AppointmentObj[] = [
  {
    startsAt: 1768406450089,
    customer: {
      firstName: "Bernice",
      lastName: "Sipes",
      phoneNumber: "+14343645199",
    },
    stylist: "Pat",
    service: "Beard trim",
    notes:
      "Dolor turba quidem veniam verus dedecor inflammatio. Vere usus umquam substantia templum vulgus bene suggero aspernatur vis. Adiuvo balbus cubo architecto conservo adnuo verbum trado auctus terebro.",
  },
  {
    startsAt: 1768410050089,
    customer: {
      firstName: "Juvenal",
      lastName: "Leannon",
      phoneNumber: "+16155737874",
    },
    stylist: "Ashley",
    service: "Cut",
    notes:
      "Vel sub spectaculum apparatus. Voveo vorago vesica eum subvenio rerum suspendo. Uxor vetus catena sperno.",
  },
  {
    startsAt: 1768413650089,
    customer: {
      firstName: "Isabell",
      lastName: "Mueller-Jakubowski",
      phoneNumber: "+12224122798",
    },
    stylist: "Pat",
    service: "Blow-dry",
    notes:
      "Tantum ater temptatio adipisci cogito quo. Aurum vulariter verto traho tamdiu. Incidunt charisma culpa soleo conscendo vero deleniti xiphias.",
  },
  {
    startsAt: 1768417250089,
    customer: {
      firstName: "Lemuel",
      lastName: "Friesen",
      phoneNumber: "+18625378213",
    },
    stylist: "Pat",
    service: "Cut & beard trim",
    notes:
      "Autus decipio administratio atqui absorbeo vesica minima coepi urbanus acidus. Dolorem desino traho defaeco angulus. Cohaero voco circumvenio commemoro careo.",
  },
  {
    startsAt: 1768420850089,
    customer: {
      firstName: "Nadia",
      lastName: "Kling",
      phoneNumber: "+15582148111",
    },
    stylist: "Ashley",
    service: "Cut & color",
    notes:
      "Autus aequus crur vapulus alter attonbitus. Tenetur commodi varius. Vero cogito a tardus patria vestigium adsidue tergiversatio.",
  },
  {
    startsAt: 1768424450089,
    customer: {
      firstName: "Destiny",
      lastName: "Botsford",
      phoneNumber: "+18119795954",
    },
    stylist: "Ashley",
    service: "Beard trim",
    notes:
      "Sortitus debeo denuncio tredecim cavus virtus vito suadeo bellicus curto. Ex demens celebrer. Viduo candidus corporis curso complectus vilitas.",
  },
  {
    startsAt: 1768428050089,
    customer: {
      firstName: "Gerald",
      lastName: "Romaguera-Reichert",
      phoneNumber: "+16956374254",
    },
    stylist: "Ashley",
    service: "Blow-dry",
    notes:
      "Terror talis aeneus usque textor ex eligendi sequi creator patruus. Stella sonitus tabgo vulariter sumptus curiositas cupressus alias vomica. Clam contigo vomito validus adflicto sophismata deprecator porro summa molestiae.",
  },
  {
    startsAt: 1768431650089,
    customer: {
      firstName: "Salvador",
      lastName: "Conroy",
      phoneNumber: "+16849941540",
    },
    stylist: "Ashley",
    service: "Blow-dry",
    notes:
      "Explicabo conscendo amitto constans verbum. Sumo utor nobis sum vereor impedit. Cura una celo.",
  },
  {
    startsAt: 1768435250089,
    customer: {
      firstName: "Joanny",
      lastName: "Borer",
      phoneNumber: "+18504771640",
    },
    stylist: "Jo",
    service: "Extensions",
    notes:
      "Vobis porro soleo ambitus consectetur solum delectus. Aut sophismata aer ullus debitis trucido. Strenuus cupressus fuga.",
  },
];
