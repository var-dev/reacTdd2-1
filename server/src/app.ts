import express from "express";
import {
  getGraphQLParameters,
  processRequest,
  renderGraphiQL,
  shouldRenderGraphiQL,
  sendResult,
// @ts-expect-error
} from "graphql-helix";

import { buildSchema } from "graphql";
import { GraphQLError } from "graphql";
import { Appointments } from "./appointments.js";
import { Customers } from "./customers.js";
import morgan from "morgan";
import schemaText from "../../src/schema.graphql";

import type { AvailableTimeSlot, Customer, CustomerWithId, Appointment } from "../../src/types.js";


const schema = buildSchema(schemaText);

export function buildApp(
  customerData: Customer[],
  appointmentData: Appointment[],
  timeSlots: AvailableTimeSlot[]
) {
  const app = express();

  const customers = new Customers(customerData);
  const appointments = new Appointments(
    appointmentData,
    timeSlots
  );

  app.use(express.static("dist"));
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/availableTimeSlots", (req, res) => {
    res.json(appointments.getTimeSlots());
  });

  app.get("/appointments/:from-:to", (req, res) => {
    res.json(
      appointments.getAppointments(
        parseInt(req.params.from),
        parseInt(req.params.to),
        Object.values(customers.all())
      )
    );
  });

  app.post("/appointments", (req, res) => {
    const appointment = req.body;
    if (appointments.isValid(appointment)) {
      appointments.add(appointment);
      res.sendStatus(201);
    } else {
      const errors = appointments.errors(appointment);
      res.status(422).json({ errors });
    }
  });

  app.post("/customers", (req, res) => {
    const customer = req.body;
    if (customers.isValid(customer)) {
      const customerWithId = customers.add(customer);
      res.status(201).json(customerWithId);
    } else {
      const errors = customers.errors(customer);
      res.status(422).json({ errors });
    }
  });

  app.get("/customers", (req, res) => {
    const results = customers.search(
      buildSearchParams(req.query)
    );
    res.json(results);
  });

  const customerValidation = (context: { reportError: (error: GraphQLError) => void }) => ({
    Argument(arg: { name: { value: string }; value: { fields: unknown[] } }) {
      if (arg.name.value === "customer") {
        validateObject(
          context,
          arg.value.fields,
          customers,
          "addCustomer"
        );
      }
    },
  });

  const validateObject = (
    context: { reportError: (error: GraphQLError) => void },
    fields: any[],
    repository: any,
    path: string
  ) => {
    const object = fields.reduce((acc: Record<string, unknown>, field) => {
      acc[field.name.value] = field.value.value;
      return acc;
    }, {});
    if (!repository.isValid(object)) {
      const errors = repository.errors(object);
      Object.keys(errors).forEach((fieldName) => {
        const errorMessage = errors[fieldName];
        if (errorMessage) {
          context.reportError(
            new GraphQLError(
              errorMessage,
              undefined,
              undefined,
              undefined,
              [path, fieldName]
            )
          );
        }
      });
    }
  };

  const appointmentValidation = (context: { reportError: (error: GraphQLError) => void }) => ({
    Argument(arg: { name: { value: string }; value: { fields: unknown[] } }) {
      if (arg.name.value === "appointment") {
        validateObject(
          context,
          arg.value.fields,
          appointments,
          "addAppointment"
        );
      }
    },
  });

  app.use("/graphql", async (request, res) => {
    // Determine whether we should render GraphiQL instead of returning an API response
    if (shouldRenderGraphiQL(request)) {
      res.send(renderGraphiQL());
    } else {
      // Extract the Graphql parameters from the request
      const { operationName, query, variables } =
        getGraphQLParameters(request);

      // Validate and execute the query
      const result = await processRequest({
        operationName,
        query,
        variables,
        request,
        schema,
        rootValueFactory: () => ({
          customer: ({ id }:CustomerWithId): { appointments: Appointment[]; firstName?: string; lastName?: string; phoneNumber?: string; stylist?: string; service?: string; notes?: string; id: number; } => {
            const customer = customers.all()[id] as CustomerWithId
            return {
              ...customer,
              appointments: appointments.forCustomer(customer.id),
            };
          },
          customers: (query: Record<string, unknown>) =>
            customers
              .search(buildSearchParams(query))
              .map((customer) => ({
                ...customer,
                appointments: () =>
                  appointments.forCustomer(
                    customer!.id
                  ),
              })),
          availableTimeSlots: () =>
            appointments.getTimeSlots(),
          appointments: ({ from, to }:{from:string; to:string;}) => {
            return appointments.getAppointments(
              parseInt(from),
              parseInt(to),
              Object.values(customers.all())
            );
          },
          addAppointment: ({ appointment }:any) => {
            appointment = Object.assign(appointment, {
              startsAt: parseInt(
                appointment.startsAt
              ),
            });
            return appointments.add(appointment);
          },
          addCustomer: ({ customer }:any) =>
            customers.add(customer),
        }),
        validationRules: [
          customerValidation,
          appointmentValidation,
        ],
      });

      sendResult(result, res);
    }
  });

  app.get("*", function (req, res) {
    res.sendFile("dist/index.html", {
      root: process.cwd(),
    });
  });

  return app;
}

type SearchParams = {
  searchTerms?: string[];
  limit?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
  after?: number;
};

function buildSearchParams({
  searchTerm,
  after,
  limit,
  orderBy,
  orderDirection,
}: Record<string, unknown>): SearchParams {
  const searchParams: SearchParams = {};
  if (searchTerm) {
    const terms = buildSearchTerms(searchTerm as string | string[]);
    if (terms) searchParams.searchTerms = terms;
  }
  if (after) searchParams.after = parseInt(after as string);
  if (limit) searchParams.limit = parseInt(limit as string);
  if (orderBy) searchParams.orderBy = orderBy as string;
  if (orderDirection) searchParams.orderDirection = orderDirection as "asc" | "desc";
  return searchParams;
}

function buildSearchTerms(searchTerm: string | string[]) {
  if (!searchTerm) return undefined;
  if (Array.isArray(searchTerm)) {
    return searchTerm;
  }
  return [searchTerm];
}