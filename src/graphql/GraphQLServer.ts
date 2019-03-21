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

async function getQuery(request: Request): Promise<string> {
  const url = new URL(request.url);
  if (url.searchParams.has("query")) {
    return url.searchParams.get("query") as string;
  } else if (request.body) {
    const contentType = request.headers.get("content-type");
    if (contentType == null) {
      throw `Must pass Content-Type header`;
    } else if (
      contentType === "application/graphql" ||
      /^text\/plain/.test(contentType)
    ) {
      return request.text();
    } else if (contentType === "application/json") {
      const json = await request.json();
      return json["query"];
    } else {
      throw `Unsupported query content type: ${contentType}`;
    }
  } else {
    throw "No query passed";
  }
}

async function getVariables(request: Request): Promise<Record<string, any> | null> {
  const url = new URL(request.url);
  if (url.searchParams.has("variables")) {
    const encodedJSON = (url.searchParams.get("variables") as string).trim();
    if (encodedJSON.length === 0) {
      return null;
    }
    return JSON.parse(encodedJSON);
  } else {
    return null;
  }
}

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const query = await getQuery(request);
  const variables = await getVariables(request);

  const source = new Source(query, "GraphQL request");

  let documentAST: ReturnType<typeof parse>;
  try {
    documentAST = parse(source);
  } catch (syntaxError) {
    console.error("Error parsing query", query);
    return errorsResponse(400, [syntaxError]);
  }

  const validationErrors = validate(schema, documentAST, specifiedRules);
  if (validationErrors.length > 0) {
    console.error("Error validating query");
    return errorsResponse(400, validationErrors);
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
  let status: 200 | 500 = 200;

  if (!!result && !result.data) {
    status = 500;
  }

  return jsonResponse(result, status);
}

type JSONResponseInput = { data?: any; errors?: ReadonlyArray<GraphQLError> };

function jsonResponse(
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

function errorsResponse(
  status: 400,
  errors: ReadonlyArray<GraphQLError>
): Response {
  return jsonResponse({ errors }, status);
}
