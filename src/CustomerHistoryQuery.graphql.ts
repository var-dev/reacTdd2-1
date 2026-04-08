import { graphql } from "relay-runtime";


export const _query = graphql`
  query CustomerHistoryQuery($id: ID!) {
    customer(id: $id) {
      id
      firstName
      lastName
      phoneNumber
      appointments {
        startsAt
        stylist
        service
        notes
      }
    }
  }
`;
