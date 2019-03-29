import { FieldResolverFunc } from "../resolvers/types";
import { makeColorPalette as tailwindColorPalette } from "../../designTokens/tailwind";

export const queryFields = `
buildCSS: CSSBuilder
`

export const schemaSource = `
input ColorPaletteInput {
  name: String
  rgb: String
}

input ColorsInput {
  palette: [ColorPaletteInput]
  tailwindCSSVersion: String
}

type CSSBuilder {
  colors(input: ColorsInput!): CSSBuilderColors
}

type CSSBuilderColors {
  textClasses(prefix: String!): [CSSBuilderSelector!]
  backgroundClasses(prefix: String!): [CSSBuilderSelector!]
}

type CSSBuilderSelector {
  selector: String!
  rules: [CSSBuilderRules!]
}

type CSSBuilderRules {
  property: String!
  value: String!
}
`

export const resolversMap = {
  CSSBuilder: {
    colors(
      parent: {},
      { input }: Record<string, any>
    ): { colors: Array<{ name: string; rgb: string }> } {
      const colorsInput = input as {
        palette?: Array<{ name: string, rgb: string }>,
        tailwindCSSVersion?: string
      }

      let colors: Array<{ name: string, rgb: string }> = [];
      
      if (colorsInput.palette) {
        colors = colors.concat(colorsInput.palette);
      }

      if (colorsInput.tailwindCSSVersion === "1.0") {
        colors = colors.concat(tailwindColorPalette())
      }

      return { colors };
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
      return parent.colors.map(colorInput => ({
        selector: `.${prefix}${colorInput.name}`,
        rules: [
          {
            property: "color",
            value: colorInput.rgb
          }
        ]
      }));
    },
    backgroundClasses(
      parent: { colors: Array<{ name: string; rgb: string }> },
      { prefix }: Record<string, any>
    ): Array<{
      selector: string;
      rules: Array<{ property: string; value: string }>;
    }> {
      return parent.colors.map(colorInput => ({
        selector: `.${prefix}${colorInput.name}`,
        rules: [
          {
            property: "background-color",
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
