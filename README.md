# CollectedQL: Content management and processing at the Edge

Store, present, and process content at the edge closest to your users with Cloudflare Workers.

## Features

## Query content from GitHub

`GET https://collected.systems/1/graphql?query=…`

```graphql
fragment textAndHTML on GitHubSourcedTextMarkdown {
  text
  toHTML {
    html
  }
}

query {
  gitHubRepoSource(owner: "RoyalIcing", repoName: "collected.guide", branch: "8cb73f4d3ebebe14c0eb49ffc5369817032567a2") {
    home: textMarkdown(path: "content/README.md"]) {
      ...textAndHTML
    }
    deployingWeb: textMarkdown(path: "content/guides/deploying-web/README.md") {
      ...textAndHTML
    }
    webToolkits: textMarkdown(path: "content/guides/web-toolkits/README.md") {
      ...textAndHTML
    }
  }
}
```

## Work with SVGs

https://collected.systems/1/github/gilbarbara/logos/93e29467eea30b2981187822143f45e562662b5c/logos/atlassian.svg?fill=orange

## Generate CSS

`GET https://collected.systems/1/graphql.css?query=…`

```graphql
query {
  buildCSS {
    colors(responsive: true, input: {
      palette: [
        {name: "brand", rgb: "#B8C2CC" },
        {name: "grey-100", rgb: "#eee" },
        {name: "grey-200", rgb: "#d8d8d8" },
        {name: "grey-300", rgb: "#b0b0b0" }
      ]
    }) {
      mediaQuery { raw }
      backgroundClasses(prefix: "bg-") {
        selector
        rules {
          property, value
        }
      }
      textClasses(prefix: "text-") {
        selector
        rules {
          property, value
        }
      }
    }
    typography(responsive: true, input: {
      sizes: [
        {name: "xs", cssValue: "0.75rem" },
        {name: "base", cssValue: "1rem" },
        {name: "double", cssValue: "200%" }
      ]
    }) {
      mediaQuery { raw }
      sizeClasses(prefix: "text-") {
        selector
        rules {
          property, value
        }
      }
    }
  }
}
```

### Caching at the edge

Like a CDN, when a user loads a piece of content, it is cached at the edge closest to them. But also when processing content, the result is cached, meaning future requests to process the same content are instant.

## Examples

Read Markdown content by its address, and convert to HTML:

https://collected.systems/1/-pipeline/%2285983f6181755a16a58c1892ac4592c52f2eccbc6ca6957055fd1e181bfea277%22|%3EStore.readTextMarkdown|%3EMarkdown.toHTML

The same as above, wrapped in a simple web page template:

https://collected.systems/1/-pipeline/%2285983f6181755a16a58c1892ac4592c52f2eccbc6ca6957055fd1e181bfea277%22|%3EStore.readTextMarkdown|%3EMarkdown.toHTML|%3EHTML.wrapInPage

Fetch the Wikipedia [page for Markdown](https://en.wikipedia.org/wiki/Markdown), and get the response’s headers:

https://collected.systems/1/-pipeline/%22https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FMarkdown%22|%3EFetch.get|%3EFetch.headers

Read the viewers IP address, and hash it using SHA256:

https://collected.systems/1/-pipeline/Viewer.ipAddress|%3EDigest.sha256

Read the uploaded body of the request, and hash it using SHA256:

```
POST https://collected.systems/1/-pipeline/Input.read|%3EDigest.sha256
Content-Type: text/markdown; charset=utf-8

# Hello!

This is some example content
```

Read the uploaded body of the request, and store it via its content-address:

```
POST https://collected.systems/1/-pipeline/Input.read%7C%3EStore.addTextMarkdown
Content-Type: text/markdown; charset=utf-8

# Hello!

This is some example content
```

Load the previously uploaded content by its content-address:

https://collected.systems/1/-pipeline/%22ed87d02a3081e7c3fec486efff9808bcf19d455db599b75b4684b944ea5e47c2%22%7C%3EStore.readTextMarkdown
