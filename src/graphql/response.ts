import { GraphQLError } from "graphql";

type JSONResponseInput = { data?: any; errors?: ReadonlyArray<GraphQLError> };

export function jsonResponse(
  json: JSONResponseInput,
  status: 200 | 400 | 500 = 200
): Response {
  return new Response(JSON.stringify(json, null, "  "), {
    status: status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

export function errorsResponse(
  status: 400,
  errors: ReadonlyArray<GraphQLError>
): Response {
  return jsonResponse({ errors }, status);
}
