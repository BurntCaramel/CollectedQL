import {
  buildSchema,
} from "graphql";

const schemaSource = `
type Query {
  textMarkdownSHA256(sha256: String): ContentAddressedTextMarkdown
  textMarkdownGitHub(owner: string, repo: string, branch: string, path: string): GitHubSourcedTextMarkdown
}

type ContentAddressedTextMarkdown {
  text: String
  toHTML: HTMLBuilder
}

type GitHubSourcedTextMarkdown {
  text: String
  toHTML: HTMLBuilder
}

type HTMLBuilder {
  html: String
}
`;
export const schema = buildSchema(schemaSource);
