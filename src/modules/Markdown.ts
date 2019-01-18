import marked from 'marked';
import { valueToString } from "./values";

export async function toHTML(value: string | ReadableStream | null): Promise<Response> {
  console.log('toHTML', value)
  if (!value) {
    throw 'Digest must be passed valid data type';
  }

  const document = await valueToString(value);
  console.log('document', document)

  const html = marked(document);
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
