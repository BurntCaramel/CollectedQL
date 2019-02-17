import * as Store from "../modules/Store";
import * as Markdown from "../modules/Markdown";
import { valueToString } from "../modules/values";
import { GraphQLResolveInfo } from "graphql/type/definition";

type Root = {};
type Context = {};

type FieldResolverFunc = (
  root: Root | any,
  args: Record<string, any>,
  context: Context
) => any | Promise<any>;

async function fetchText(url: string): Promise<string | null> {
  const response = await fetch(url);
  if (!response.body) {
    return null;
  }
  return valueToString(response.body);
}

const TextMarkdownResolver = {
  async text(
    parent: string,
    args: {},
    context: Context
  ): Promise<string | null> {
    return parent;
  },
  async toHTML(
    parent: string,
    args: {},
    context: Context
  ): Promise<string | null> {
    const htmlResponse = await Markdown.toHTML(parent);
    return valueToString(htmlResponse);
  }
} as Record<string, FieldResolverFunc>

const resolversMap = {
  Query: {
    async textMarkdownSHA256(
      root: Root,
      { sha256 }: Record<string, any>,
      context: Context
    ): Promise<string | null> {
      const response = await Store.readTextMarkdown(sha256);
      if (!response.body) {
        return null;
      }
      return valueToString(response.body);
    },
    async textMarkdownGitHub(
      root: Root,
      {owner, repoName, branch, path}: Record<string, any>,
      context: Context
    ): Promise<string | null> {
      const url = `https://cdn.jsdelivr.net/gh/${owner}/${repoName}@${branch}/${path}`
      return fetchText(url);
    },
    gitHubRepoSource(root: Root, {owner, repoName, branch}: Record<string, any>) {
      return { owner, repoName, branch };
    }
  },
  GitHubRepoSource: {
    textMarkdown({ owner, repoName, branch }: any, { path }: Record<string, any>, context: Context): Promise<string | null> {
      const url = `https://cdn.jsdelivr.net/gh/${owner}/${repoName}@${branch}/${path}`
      return fetchText(url);
    }
  },
  ContentAddressedTextMarkdown: TextMarkdownResolver,
  GitHubSourcedTextMarkdown: TextMarkdownResolver,
  HTMLBuilder: {
    async html(
      parent: string,
      args: {},
      context: Context
    ): Promise<string | null> {
      return parent;
    }
  }
} as Record<string, Record<string, FieldResolverFunc>>;

export function resolver(
  source: any,
  args: Record<string, any>,
  context: Context,
  info: GraphQLResolveInfo
) {
  const fieldName = info.fieldName;
  const parentName = info.parentType.name;
  console.log("parentName", parentName);
  if (resolversMap[parentName]) {
    if (typeof resolversMap[parentName][fieldName] === "function") {
      return resolversMap[parentName][fieldName](source || info.rootValue, args, context);
    }
  }

  if (source) {
    return source[fieldName];
  }

  return null;
}