import { ExecuteResult, executeWithQuery } from "./executeRequest";
import { jsonResponse, errorsResponse } from "./response";
import { GraphQLRequestSource, queryAndVariablesFromSource } from "./source";

export async function jsonHandler(
  executeResult: ExecuteResult
): Promise<Response> {
  if (executeResult.type === "invalidRequest") {
    return errorsResponse(400, executeResult.errors);
  }

  const result = executeResult.result;
  let status: 200 | 500 = 200;

  // TODO check what the spec says for correct the status code when no data
  if (!!result && !result.data) {
    status = 500;
  }

  return jsonResponse(result, status);
}

export async function handleRequestFromSource(source: GraphQLRequestSource): Promise<Response> {
  const { query, variables } = await queryAndVariablesFromSource(source);
  const executeResult = await executeWithQuery(query, variables);
  return jsonHandler(executeResult);
}
