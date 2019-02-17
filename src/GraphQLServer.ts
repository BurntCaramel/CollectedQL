// import { buildSchema, Source, parse, specifiedRules, validate, execute, GraphQLError } from 'graphql';
import * as Store from "./modules/Store";
import * as Markdown from "./modules/Markdown";
import { valueToString } from "./modules/values";
import { GraphQLResolveInfo } from "graphql/type/definition";
import {
  buildSchema,
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

const schemaSource = `
type Query {
  textMarkdownSHA256(sha256: String): ContentAddressedTextMarkdown
}

type ContentAddressedTextMarkdown {
  text: String
  toHTML: HTMLBuilder
}

type HTMLBuilder {
  html: String
}
`;
const schema = buildSchema(schemaSource);

type Root = {};
type Context = {};

type FieldResolverFunc = (
  root: Root | any,
  args: Record<string, any>,
  context: Context
) => any | Promise<any>;

const resolversMap = {
  Query: {
    async textMarkdownSHA256(
      root: Root,
      { sha256 }: Record<string, any>,
      context: Context
    ): Promise<string | null> {
      const response = await Store.readTextMarkdown(sha256);
      if (!response.body) {
        return null;
      }
      return valueToString(response.body);
    }
  } as Record<string, FieldResolverFunc>,
  ContentAddressedTextMarkdown: {
    async text(
      parent: string,
      args: {},
      context: Context
    ): Promise<string | null> {
      return parent;
    },
    async toHTML(
      parent: string,
      args: {},
      context: Context
    ): Promise<string | null> {
      const htmlResponse = await Markdown.toHTML(parent);
      return valueToString(htmlResponse);
    }
  } as Record<string, FieldResolverFunc>,
  HTMLBuilder: {
    async html(
      parent: string,
      args: {},
      context: Context
    ): Promise<string | null> {
      return parent;
    }
  }
} as Record<string, Record<string, FieldResolverFunc>>;

function resolver(
  source: any,
  args: Record<string, any>,
  context: Context,
  info: GraphQLResolveInfo
) {
  const fieldName = info.fieldName;
  const parentName = info.parentType.name;
  console.log("parentName", parentName);
  return resolversMap[parentName][fieldName](source || info.rootValue, args, context);
}

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
      throw `Unsupported content type: ${contentType}`;
    }
  } else {
    throw "No query passed";
  }
}

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  let query: string = await getQuery(request);
  console.dir(query);

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
    {},
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
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

function errorsResponse(
  status: 400,
  errors: ReadonlyArray<GraphQLError>
): Response {
  return jsonResponse({ errors }, status);
}
