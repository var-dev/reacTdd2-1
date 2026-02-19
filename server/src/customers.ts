import { faker } from "@faker-js/faker";

import type { Customer, CustomerWithId } from '../../src/types.js'

declare global {
  interface Array<T> {
    unique(): Array<T>;
    pickRandom(): T;
  }
}

Array.prototype.unique = function () {
  return this.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
};

Array.prototype.flatMap = function (f) {
  return Array.prototype.concat.apply(
    [],
    this.map(f)
  );
};

function generateFakeCustomer(id:string) {
  return {
    id,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    phoneNumber: faker.phone.number({style: 'international'}),
  };
}

export function generateFakeCustomers() {
  const customers:Customer[] = [];
  for (let i = 0; i < 1500; ++i) {
    customers.push(generateFakeCustomer(String(i)));
  }
  return customers;
}

export class Customers {
  private customers: { [key: number]: CustomerWithId };
  private nextId: number;
  constructor(initialCustomers: Customer[] = []) {
    this.customers = {};
    this.nextId = 0;
    this.add = this.add.bind(this);
    this.all = this.all.bind(this);
    this.isValid = this.isValid.bind(this);

    initialCustomers.forEach(this.add);
  }

  add(customer: Customer): Customer {
    const customerWithId = Object.assign(
      {},
      customer,
      {
        id: this.nextId++,
      }
    );
    this.customers[customerWithId.id] =
      customerWithId;
    return customerWithId;
  }

  all(): { [key: number]: Customer; } {
    return Object.assign({}, this.customers);
  }

  isValid(customer: Customer) {
    return (
      Object.keys(this.errors(customer)).length === 0
    );
  }

  errors(customer: Customer) {
    let errors = {};
    errors = Object.assign(
      errors,
      this.requiredValidation(
        customer,
        "firstName",
        "First name"
      )
    );
    errors = Object.assign(
      errors,
      this.requiredValidation(
        customer,
        "lastName",
        "Last name"
      )
    );
    errors = Object.assign(
      errors,
      this.requiredValidation(
        customer,
        "phoneNumber",
        "Phone number"
      )
    );
    errors = Object.assign(
      errors,
      this.uniqueValidation(
        "phoneNumber",
        customer.phoneNumber,
        "Phone number"
      )
    );
    return errors;
  }

  requiredValidation(
    customer: Customer,
    field: keyof Customer,
    fieldDescription: string
  ) {
    if (
      !customer[field] ||
      (customer[field] as string).trim() === ""
    ) {
      return {
        [field]: fieldDescription + " is required",
      };
    }
    return {};
  }

  uniqueValidation(
    field: keyof Customer,
    fieldValue: Customer[keyof Customer],
    fieldDescription: string
  ) {
    if (
      Object.entries(this.customers)
        .map(([, c]) => c[field])
        .includes(fieldValue!)
    ) {
      return {
        [field]:
          fieldDescription +
          " already exists in the system",
      };
    }
    return {};
  }

  searchForTerm(term: string) {
    var startsWith = new RegExp(`^${term}`, "i");
    return Object.keys(this.customers).filter(
      (customerId) => {
        const customer = this.customers[Number(customerId)];
        return (
          startsWith.test(customer!.firstName!) ||
          startsWith.test(customer!.lastName!) ||
          startsWith.test(customer!.phoneNumber!)
        );
      }
    );
  }

  search({
    searchTerms,
    limit,
    orderBy,
    orderDirection,
    after,
  }: {
    searchTerms?: string[];
    limit?: number;
    orderBy?: string;
    orderDirection?: "asc" | "desc";
    after?: number;
}) {
    limit = limit || 10;
    orderBy = orderBy || "firstName";
    searchTerms = searchTerms || [""];
    const sorted = searchTerms
      .flatMap((term: string) => this.searchForTerm(term))
      .unique()
      .map((id) => this.customers[Number(id)])
      .sort((l, r) =>
        orderDirection === "desc"
          ? (r as any)[orderBy].localeCompare((l as any)[orderBy])
          : (l as any)[orderBy].localeCompare((r as any)[orderBy])
      );

    const afterPosition = after
      ? sorted.findIndex((c) => c!.id === after) + 1
      : 0;

    return sorted.slice(
      afterPosition,
      afterPosition + limit
    );
  }
}