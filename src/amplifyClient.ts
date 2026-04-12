import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";

Amplify.configure({
  API:{
    GraphQL:{
      endpoint:'http://localhost:3000/graphql',
      region:'us-east-1',
      defaultAuthMode: 'none'

    }
  }
})

export const amplifyClient = generateClient({
  endpoint:'http://localhost:3000/graphql',
  authMode:'none'
});
