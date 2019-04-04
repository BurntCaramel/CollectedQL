import { fetchTextFromGitHub } from "../sources/gitHub";

export type GraphQLRequestSource =
  | { type: "http"; request: Request }
  | {
      type: "github";
      owner: string;
      repo: string;
      tagOrCommit: string;
      path: string;
    };

async function getQueryFromRequest(request: Request): Promise<string> {
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

async function getVariablesFromRequest(
  request: Request
): Promise<Record<string, any> | null> {
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

export async function queryAndVariablesFromSource(
  source: GraphQLRequestSource
): Promise<{ query: string; variables: Record<string, any> | null }> {
  if (source.type === "http") {
    return {
      query: await getQueryFromRequest(source.request),
      variables: await getVariablesFromRequest(source.request)
    };
  } else if (source.type === "github") {
    return {
      query: await fetchTextFromGitHub(source),
      variables: null
    };
  } else {
    throw new Error("Impossible type");
  }
}
