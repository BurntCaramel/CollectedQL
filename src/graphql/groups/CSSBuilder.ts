import { FieldResolverFunc } from "../resolvers/types";
import {
  makeColorPalette as tailwindColorPalette,
  makeTextSizes as tailwindTextSizes
} from "../../designTokens/tailwind";

export const queryFields = `
buildCSS: CSSBuilder
`;

export const schemaSource = `
input ColorPaletteInput {
  name: String
  rgb: String
}

input ColorsInput {
  palette: [ColorPaletteInput]
  tailwindCSSVersion: String
}

input TextSizeInput {
  name: String
  cssValue: String
}

input TypographyInput {
  palette: [TextSizeInput]
  tailwindCSSVersion: String
}

type CSSBuilder {
  colors(input: ColorsInput!): CSSBuilderColors
  # colors(input: ColorsInput!, responsive: Boolean): CSSBuilderColors
  typography(input: TypographyInput!): CSSBuilderTypography
}

type CSSBuilderColors {
  # mediaQuery: CSSBuilderMediaQuery
  textClasses(prefix: String!): [CSSBuilderSelector!]
  backgroundClasses(prefix: String!): [CSSBuilderSelector!]
}

type CSSBuilderTypography {
  # mediaQuery: CSSBuilderMediaQuery
  sizeClasses(prefix: String!): [CSSBuilderSelector!]
  lineHeightClasses(prefix: String!): [CSSBuilderSelector!]
  familyClasses(prefix: String!): [CSSBuilderSelector!]
  weightClasses(prefix: String!): [CSSBuilderSelector!]
  italicClasses(prefix: String!): [CSSBuilderSelector!]
  decorationClasses(prefix: String!): [CSSBuilderSelector!]
}

type CSSBuilderSelector {
  selector: String!
  rules: [CSSBuilderRules!]
}

type CSSBuilderRules {
  property: String!
  value: String!
}
`;

type CSSBuilderSelector = {
  selector: string;
  rules: Array<{ property: string; value: string }>;
};

const responsiveMediaQueries = {
  xs: null,
  sm: "min-width: 576px",
  md: "min-width: 768px",
  lg: "min-width: 992px",
  xl: "min-width: 1200px"
};

export const resolversMap = {
  CSSBuilder: {
    colors(
      parent: {},
      { input }: Record<string, any>
    ): { colors: Array<{ name: string; rgb: string }> } {
      const colorsInput = input as {
        palette?: Array<{ name: string; rgb: string }>;
        tailwindCSSVersion?: string;
      };

      let colors: Array<{ name: string; rgb: string }> = [];

      if (colorsInput.palette) {
        colors = colors.concat(colorsInput.palette);
      }

      if (colorsInput.tailwindCSSVersion === "1.0") {
        colors = colors.concat(tailwindColorPalette());
      }

      return { colors };
    },
    typography(
      parent: {},
      { input }: Record<string, any>
    ): { sizes: Array<{ name: string; cssValue: string }> } {
      const typographyInput = input as {
        palette?: Array<{ name: string; cssValue: string }>;
        tailwindCSSVersion?: string;
      };

      let sizes: Array<{ name: string; cssValue: string }> = [];

      if (typographyInput.palette) {
        sizes = sizes.concat(typographyInput.palette);
      }

      if (typographyInput.tailwindCSSVersion === "1.0") {
        sizes = sizes.concat(tailwindTextSizes());
      }

      return { sizes };
    }
  },
  CSSBuilderColors: {
    textClasses(
      parent: { colors: Array<{ name: string; rgb: string }> },
      { prefix }: Record<string, any>
    ): Array<CSSBuilderSelector> {
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
    ): Array<CSSBuilderSelector> {
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
  CSSBuilderTypography: {
    sizeClasses(
      parent: { sizes: Array<{ name: string; cssValue: string }> },
      { prefix }: Record<string, any>
    ): Array<CSSBuilderSelector> {
      return parent.sizes.map(sizeInput => ({
        selector: `.${prefix}${sizeInput.name}`,
        rules: [
          {
            property: "font-size",
            value: sizeInput.cssValue
          }
        ]
      }));
    }
    // lineHeightClasses(prefix: string!): [CSSBuilderSelector!]
    // familyClasses(prefix: string!): [CSSBuilderSelector!]
    // weightClasses(prefix: string!): [CSSBuilderSelector!]
    // italicClasses(prefix: string!): [CSSBuilderSelector!]
    // decorationClasses(prefix: string!): [CSSBuilderSelector!]
  },

  CSSBuilderSelector: {}
  // CSSBuilderRules: {

  // }
} as Record<string, Record<string, FieldResolverFunc>>;
