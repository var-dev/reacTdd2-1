declare module 'graphql-helix' {
  import { GraphQLSchema, ExecutionResult, ValidationRule } from 'graphql';
  import { IncomingMessage, ServerResponse } from 'http';
  
  export interface GraphQLParameters {
    operationName?: string;
    query?: string;
    variables?: any;
  }
  
  export interface ProcessRequestOptions {
    operationName?: string;
    query?: string;
    variables?: any;
    request: IncomingMessage;
    schema: GraphQLSchema;
    rootValueFactory?: () => any;
    validationRules?: ValidationRule[];
  }
  
  export function getGraphQLParameters(request: IncomingMessage): GraphQLParameters;
  
  export function processRequest(options: ProcessRequestOptions): Promise<ExecutionResult>;
  
  export function renderGraphiQL(): string;
  
  export function shouldRenderGraphiQL(request: IncomingMessage): boolean;
  
  export function sendResult(result: ExecutionResult, response: ServerResponse): void;
}