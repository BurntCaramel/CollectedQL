import { valueToString } from "./values";

const wrapHTML = (innerHTML: string) => `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
* {
  box-sizing: border-box;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;
  max-width: 48rem;
  margin: auto;
  padding: 1rem;
}
</style>
</head>
<body>
${innerHTML}
</body>
</html>`

export async function wrapInPage(value: string | ReadableStream | null): Promise<Response> {
  if (!value) {
    throw 'HTML must be passed valid data type';
  }

  const innerHTML = await valueToString(value);

  const pageHTML = wrapHTML(innerHTML);

  return new Response(pageHTML, {
    headers: {
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
