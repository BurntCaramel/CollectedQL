import { executeRequest } from "./executeRequest";
import { jsonResponse, errorsResponse } from "./response";

export async function handleRequest(request: Request): Promise<Response> {
  const executeResult = await executeRequest(request);
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
