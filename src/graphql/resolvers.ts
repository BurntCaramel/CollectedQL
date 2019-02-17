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
      {owner, repo, branch, path}: Record<string, any>,
      context: Context
    ): Promise<string | null> {
      const url = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${path}`
      const response = await fetch(url);
      if (!response.body) {
        return null;
      }
      return valueToString(response.body);
    }
  } as Record<string, FieldResolverFunc>,
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
  return resolversMap[parentName][fieldName](source || info.rootValue, args, context);
}