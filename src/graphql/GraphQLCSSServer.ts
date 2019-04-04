import { executeWithQuery } from "./executeRequest";
import { errorsResponse } from "./response";
import {
  ExecutionResultDataDefault,
  ExecutionResult
} from "graphql/execution/execute";
import { queryAndVariablesFromSource, GraphQLRequestSource } from "./source";

export async function handleRequestFromSource(
  source: GraphQLRequestSource
): Promise<Response> {
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

interface MediaQueryNode {
  next?: MediaQueryNode;
  mediaQuery: string | null;
  classes: Array<CSSClass>;
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
    colors?: Array<{
      mediaQuery: { raw: string } | null;
      textClasses: Array<CSSClass>;
      backgroundClasses: Array<CSSClass>;
    }>;
    typography?: Array<{
      mediaQuery: { raw: string } | null;
      sizeClasses: Array<CSSClass>;
    }>;
  };
}

function cssResponse(
  result: ExecutionResult<CSSData>,
  status: 200 | 400 | 500 = 200
): Response {
  const mediaQueryNodeHead: MediaQueryNode = { mediaQuery: null, classes: [] };
  let mediaQueryNodeCurrent = mediaQueryNodeHead;

  function pushMediaQuery(mediaQuery: string | null) {
    const newMediaQueryNode: MediaQueryNode = { mediaQuery, classes: [] };
    mediaQueryNodeCurrent.next = newMediaQueryNode;
    mediaQueryNodeCurrent = newMediaQueryNode;
  }

  function pushClass(cssClass: CSSClass) {
    mediaQueryNodeCurrent.classes.push(cssClass);
  }

  if (!!result.data && !!result.data.buildCSS) {
    const { colors, typography } = result.data.buildCSS;

    if (colors) {
      colors.forEach(colorsItem => {
        pushMediaQuery(colorsItem.mediaQuery ? colorsItem.mediaQuery.raw : null);

        colorsItem.textClasses.forEach(cssClass => {
          pushClass(cssClass);
        });

        colorsItem.backgroundClasses.forEach(cssClass => {
          pushClass(cssClass);
        });
      });
    }

    if (typography) {
      typography.forEach(typographyItem => {
        pushMediaQuery(typographyItem.mediaQuery ? typographyItem.mediaQuery.raw : null);

        typographyItem.sizeClasses.forEach(cssClass => {
          pushClass(cssClass);
        });
      });
    }
  }

  let lines: Array<string> = [];
  let mediaQueryNode: MediaQueryNode | undefined = mediaQueryNodeHead;
  while (mediaQueryNode) {
    if (mediaQueryNode.mediaQuery) {
      if (lines[lines.length - 1] !== "") {
        lines.push("");
      }
      lines.push(`@media (${mediaQueryNode.mediaQuery}) {`);
    }
    mediaQueryNode.classes.forEach(cssClass => {
      const rulesString = cssClass.rules
        .map(rule => `${rule.property}: ${rule.value};`)
        .join(" ");

      lines.push(`${cssClass.selector} { ${rulesString} }`);
    });
    if (mediaQueryNode.mediaQuery) {
      lines.push(`}`);
      lines.push("");
    }

    mediaQueryNode = mediaQueryNode.next;
  }
  const css = lines.join("\n");

  return new Response(css, {
    status: status,
    headers: {
      "Content-Type": "text/css; charset=utf-8",
      "Cache-Control": "public, max-age=31536000",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
