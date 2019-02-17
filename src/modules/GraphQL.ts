import * as GraphQL from 'graphql';
import { valueToString } from './values';

export async function buildSchema(value: string | ReadableStream | null): Promise<string> {
  if (!value) {
    throw 'GraphQL.parseSchema must be passed valid type';
  }

  const schemaSource = await valueToString(value);

  const schema = GraphQL.buildSchema(schemaSource);
  return JSON.stringify(schema);
}