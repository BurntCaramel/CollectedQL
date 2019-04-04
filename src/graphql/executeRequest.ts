import {
  Source,
  parse,
  specifiedRules,
  validate,
  execute,
  GraphQLError
} from "graphql";
import {
  ExecutionResult,
  ExecutionResultDataDefault
} from "graphql/execution/execute";
import { resolver } from "./resolvers/index";
import { schema } from "./schema";

export type ExecuteResult = { type: "invalidRequest", errors: ReadonlyArray<GraphQLError> } | { type: "success", result: ExecutionResult<ExecutionResultDataDefault> }

export async function executeWithQuery(query: string, variables: Record<string, any> | null): Promise<ExecuteResult> {
  const source = new Source(query, "GraphQL request");

  let documentAST: ReturnType<typeof parse>;
  try {
    documentAST = parse(source);
  } catch (syntaxError) {
    console.error("Error parsing query", query);
    return { type: "invalidRequest", errors: [syntaxError] };
  }

  const validationErrors = validate(schema, documentAST, specifiedRules);
  if (validationErrors.length > 0) {
    console.error("Error validating query");
    return { type: "invalidRequest", errors: validationErrors };
  }

  const result: ExecutionResult<ExecutionResultDataDefault> = await execute(
    schema,
    documentAST,
    {},
    {},
    variables,
    null,
    resolver
  );

  return { type: "success", result };
}
