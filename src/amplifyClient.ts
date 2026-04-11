import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";

Amplify.configure({})

export const amplifyClient = generateClient();
