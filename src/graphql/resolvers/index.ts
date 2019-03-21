import * as Store from "../../modules/Store";
import * as Markdown from "../../modules/Markdown";
import { valueToString } from "../../modules/values";
import { GraphQLResolveInfo } from "graphql/type/definition";
import { TrelloBoard, TrelloList, TrelloCard } from "../../modules/Trello";

type Root = {};
type Context = {};

type FieldResolverFunc = (
  root: Root | any,
  args: Record<string, any>,
  context: Context
) => any | Promise<any>;

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  return response.text();
}

interface TextMarkdownObject {
  text: string;
}

const TextMarkdownResolver = {
  async toHTML(parent: TextMarkdownObject, args: {}, context: Context) {
    const htmlResponse = await Markdown.toHTML(parent.text);
    return { html: await htmlResponse.text() };
  }
} as Record<string, FieldResolverFunc>;

const resolversMap = {
  Query: {
    async textMarkdownSHA256(
      root: Root,
      { sha256 }: Record<string, any>,
      context: Context
    ): Promise<TextMarkdownObject | null> {
      const response = await Store.readTextMarkdown(sha256);
      return { text: await response.text() };
    },
    async textMarkdownGitHub(
      root: Root,
      { owner, repoName, branch, path }: Record<string, any>,
      context: Context
    ): Promise<TextMarkdownObject | null> {
      const url = `https://cdn.jsdelivr.net/gh/${owner}/${repoName}@${branch}/${path}`;
      return { text: await fetchText(url) };
    },
    gitHubRepoSource(
      root: Root,
      { owner, repoName, branch }: Record<string, any>
    ) {
      return { owner, repoName, branch };
    },
    async trelloBoardSource(root: Root, { boardID }: Record<string, any>) {
      const url = `https://api.trello.com/1/boards/${boardID}?lists=all&cards=all`;
      const res = await fetch(url);
      const data = (await res.json()) as TrelloBoard;
      return data;
    },
    buildCSS() {
      return {
        value: true
      };
    }
  },
  GitHubRepoSource: {
    async textMarkdown(
      { owner, repoName, branch }: any,
      { path }: Record<string, any>,
      context: Context
    ): Promise<TextMarkdownObject | null> {
      const url = `https://cdn.jsdelivr.net/gh/${owner}/${repoName}@${branch}/${path}`;
      return { text: await fetchText(url) };
    }
  },
  TrelloBoardSource: {
    boardID({ id }: TrelloBoard) {
      return id;
    },
    lists({ lists, cards }: TrelloBoard) {
      return lists.map(list => ({
        ...list,
        cards: cards.filter(card => card.idList === list.id)
      }));
    }
  },
  TrelloBoardList: {
    listID({ id }: TrelloList) {
      return id;
    },
    boardID({ idBoard }: TrelloList) {
      return idBoard;
    },
    cards({ cards }: { cards: Array<TrelloCard> }) {
      return cards;
    }
  },
  TrelloBoardCard: {
    cardID({ id }: TrelloCard) {
      return id;
    },
    listID({ idList }: TrelloCard) {
      return idList;
    },
    content({ desc }: TrelloCard): TextMarkdownObject {
      return { text: desc };
    }
  },
  TrelloCardDescriptionMarkdown: TextMarkdownResolver,
  ContentAddressedTextMarkdown: TextMarkdownResolver,
  GitHubSourcedTextMarkdown: TextMarkdownResolver,
  ///
  HTMLBuilder: {
    async html(
      parent: { html: string },
      args: {},
      context: Context
    ): Promise<string | null> {
      return parent.html;
    }
  },
  ///
  CSSBuilder: {
    colors(
      parent: {},
      { input }: Record<string, any>
    ): { colors: Array<{ name: string; rgb: string }> } {
      return { colors: input.palette };
    }
  },
  CSSBuilderColors: {
    textClasses(
      parent: { colors: Array<{ name: string; rgb: string }> },
      { prefix }: Record<string, any>
    ): Array<{
      selector: string;
      rules: Array<{ property: string; value: string }>;
    }> {
      console.log("textRules parent", parent);
      return parent.colors.map(colorInput => ({
        selector: `.${prefix}${colorInput.name}`,
        rules: [
          {
            property: "color",
            value: colorInput.rgb
          }
        ]
      }));
    }
  },
  CSSBuilderSelector: {}
  // CSSBuilderRules: {

  // }
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
      return resolversMap[parentName][fieldName](
        source || info.rootValue,
        args,
        context
      );
    }
  }

  if (source) {
    return source[fieldName];
  }

  return null;
}
