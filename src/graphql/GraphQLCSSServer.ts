import { executeWithQuery } from "./executeRequest";
import { errorsResponse } from "./response";
import {
  ExecutionResultDataDefault,
  ExecutionResult
} from "graphql/execution/execute";
import { queryAndVariablesFromSource, GraphQLRequestSource } from "./source";

export async function handleRequestFromSource(source: GraphQLRequestSource): Promise<Response> {
  const { query, variables } = await queryAndVariablesFromSource(source);
  const executeResult = await executeWithQuery(query, variables);
  if (executeResult.type === "invalidRequest") {
    return errorsResponse(400, executeResult.errors);
  }

  const result = executeResult.result;
  let status: 200 | 500 = 200;

  // TODO check what the spec says for correct the status code when no data
  if (!!result && !result.data) {
    status = 500;
  }

  return cssResponse(result, status);
}

interface CSSClass {
  selector: string;
  rules: Array<{
    property: string;
    value: string;
  }>;
}

interface CSSData extends ExecutionResultDataDefault {
  buildCSS?: {
    colors: {
      textClasses: Array<CSSClass>;
      backgroundClasses: Array<CSSClass>;
    };
  };
}

function cssResponse(
  result: ExecutionResult<CSSData>,
  status: 200 | 400 | 500 = 200
): Response {
  console.log("CSS!");

  const classes: Array<CSSClass> = [];
  if (!!result.data && !!result.data.buildCSS) {
    const colors = result.data.buildCSS.colors;

    colors.textClasses.forEach(cssClass => {
      classes.push(cssClass);
    });

    colors.backgroundClasses.forEach(cssClass => {
      classes.push(cssClass);
    });
  }

  const css = classes
    .map(cssClass => {
      const rulesString = cssClass.rules
        .map(rule => `${rule.property}: ${rule.value};`)
        .join(" ");
      return `${cssClass.selector} { ${rulesString} }`;
    })
    .join("\n");

  return new Response(css, {
    status: status,
    headers: {
      "Content-Type": "text/css; charset=utf-8",
      "Cache-Control": "public, max-age=31536000",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
