# Syrup: Content management and processing at the Edge

Store, present, and process content at the edge closest to your users with Cloudflare Workers.

## Features

### Server rendering without the headaches

Server render React, Preact, or your favorite JavaScript framework. There’s no Node.js instances to manage, as Cloudflare Workers automatically scales V8 instances for you.

### Process on the fly

Render Markdown & HTML templates, call APIs, process data, validate signatures, and more. Cloudflare Workers have a full JavaScript environment.

### Immutable content

Text and images are stored by their address. The same content has the same address. This means content is efficiently de-duped and reused.

### Caching at the edge

Like a CDN, when a user loads a piece of content, it is cached at the edge closest to them. But also when processing content, the result is cached, meaning future requests to process the same content are instant.

## Examples

Read Markdown content by its address, and convert to HTML:

https://collected.systems/pipeline/1/%2285983f6181755a16a58c1892ac4592c52f2eccbc6ca6957055fd1e181bfea277%22|%3EStore.readTextMarkdown|%3EMarkdown.toHTML

The same as above, wrapped in a simple web page template:

https://collected.systems/pipeline/1/%2285983f6181755a16a58c1892ac4592c52f2eccbc6ca6957055fd1e181bfea277%22|%3EStore.readTextMarkdown|%3EMarkdown.toHTML|%3EHTML.wrapInPage

Fetch the Wikipedia [page for Markdown](https://en.wikipedia.org/wiki/Markdown), and get the response’s headers:

https://collected.systems/pipeline/1/%22https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FMarkdown%22|%3EFetch.get|%3EFetch.headers

Read the viewers IP address, and hash it using SHA256:

https://collected.systems/pipeline/1/Viewer.ipAddress|%3EDigest.sha256

Read the uploaded body of the request, and hash it using SHA256:

```
POST https://collected.systems/pipeline/1/Input.read|%3EDigest.sha256
Content-Type: text/markdown; charset=utf-8

# Hello!

This is some example content
```

Read the uploaded body of the request, and store it via its content-address:

```
POST https://collected.systems/pipeline/1/Input.read%7C%3EStore.addTextMarkdown
Content-Type: text/markdown; charset=utf-8

# Hello!

This is some example content
```

Load the previously uploaded content by its content-address:

https://collected.systems/pipeline/1/%22ed87d02a3081e7c3fec486efff9808bcf19d455db599b75b4684b944ea5e47c2%22%7C%3EStore.readTextMarkdown
