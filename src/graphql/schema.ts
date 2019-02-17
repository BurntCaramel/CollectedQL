import {
  buildSchema,
} from "graphql";

const schemaSource = `
type Query {
  textMarkdownSHA256(sha256: String): ContentAddressedTextMarkdown
  textMarkdownGitHub(owner: String, repoName: String, branch: String, path: String): GitHubSourcedTextMarkdown

  gitHubRepoSource(owner: String, repoName: String, branch: String): GitHubRepoSource
}

type GitHubRepoSource {
  owner: String
  repoName: String
  branch: String
  textMarkdown(path: String): GitHubSourcedTextMarkdown
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
