import marked from "marked";
import { valueToString } from "./values";

export async function toHTML(
  value: string | ReadableStream | null
): Promise<Response> {
  if (value == null) {
    throw "Markdown must be passed valid data type, not " + typeof value;
  }

  const document = await valueToString(value);

  const html = document.length === 0 ? "" : marked(document);
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
