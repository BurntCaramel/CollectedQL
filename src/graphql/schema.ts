import { buildSchema } from "graphql";

import {
  schemaSource as cssSchemaSource,
  queryFields as cssQueryFields
} from "./groups/CSSBuilder";

const schemaSource = `
type HTMLBuilder {
  html: String
}

type Query {
  textMarkdownSHA256(sha256: String): ContentAddressedTextMarkdown
  textMarkdownGitHub(owner: String, repoName: String, branch: String, path: String): GitHubSourcedTextMarkdown

  gitHubRepoSource(owner: String, repoName: String, branch: String): GitHubRepoSource
  trelloBoardSource(boardID: String): TrelloBoardSource
  #webPageSource(url: String): WebPageSource
  httpsSource(host: String): HTTPSSource
  ${cssQueryFields}
}

# Collected Store
type ContentAddressedTextMarkdown {
  text: String
  toHTML: HTMLBuilder
}

# GitHub
type GitHubRepoSource {
  owner: String
  repoName: String
  branch: String

  textMarkdown(path: String): GitHubSourcedTextMarkdown
  #javascript(path: String): GitHubSourcedJavaScript
}

type GitHubSourcedTextMarkdown {
  text: String
  toHTML: HTMLBuilder
}

# Trello
type TrelloBoardSource {
  boardID: String
  url: String
  name: String

  lists: [TrelloBoardList]
}

type TrelloBoardList {
  listID: String
  boardID: String
  name: String

  cards: [TrelloBoardCard]
}

type TrelloBoardCard {
  cardID: String
  listID: String
  boardID: String
  name: String
  content: TrelloCardDescriptionMarkdown
}

type TrelloCardDescriptionMarkdown {
  text: String
  toHTML: HTMLBuilder
}

${cssSchemaSource}

# HTTPS

type HTTPSSource {
  request(path: String): HTTPSRequest
}

type HTTPSRequest {
  response: HTTPSResponse
}

type HTTPSResponse {
  headers: HTTPSResponseHeaders
}

type HTTPSResponseHeaders {
  all: [HTTPSResponseHeaderKeyValuePair!]
}

type HTTPSResponseHeaderKeyValuePair {
  name: String!
  value: String!
}
`;
export const schema = buildSchema(schemaSource);
