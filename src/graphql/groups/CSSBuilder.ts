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
  sizes: [TextSizeInput]
  tailwindCSSVersion: String
}

type CSSBuilder {
  colors(input: ColorsInput!, responsive: Boolean): [CSSBuilderColors]
  typography(input: TypographyInput!, responsive: Boolean): [CSSBuilderTypography]
}

type CSSBuilderColors {
  breakpoint: String
  mediaQuery: CSSBuilderMediaQuery
  textClasses(prefix: String!): [CSSBuilderSelector!]
  backgroundClasses(prefix: String!): [CSSBuilderSelector!]
}

type CSSBuilderTypography {
  breakpoint: String
  mediaQuery: CSSBuilderMediaQuery
  sizeClasses(prefix: String!): [CSSBuilderSelector!]
  lineHeightClasses(prefix: String!): [CSSBuilderSelector!]
  familyClasses(prefix: String!): [CSSBuilderSelector!]
  weightClasses(prefix: String!): [CSSBuilderSelector!]
  italicClasses(prefix: String!): [CSSBuilderSelector!]
  decorationClasses(prefix: String!): [CSSBuilderSelector!]
}

type CSSBuilderMediaQuery {
  raw: String
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

interface CSSBuilderColorBase {
  breakpoint: string | null;
  colors: Array<{ name: string; rgb: string }>;
}

interface CSSBuilderTypographyBase {
  breakpoint: string | null;
  sizes: Array<{ name: string; cssValue: string }>;
}

const reusableResolvers = {
  mediaQuery(parent: { breakpoint: string | null }): { raw: string } | null {
    if (parent.breakpoint == null) {
      return null;
    }

    const raw = (responsiveMediaQueries as Record<string, string | null>)[
      parent.breakpoint
    ];
    if (raw == null) {
      return null;
    }
    return { raw };
  },
}

export const resolversMap = {
  CSSBuilder: {
    colors(
      parent: {},
      { input, responsive }: Record<string, any>
    ): Array<CSSBuilderColorBase> {
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

      if (responsive) {
        return Object.keys(responsiveMediaQueries).map(breakpoint => ({
          breakpoint: (responsiveMediaQueries as Record<string, string | null>)[
            breakpoint
          ]
            ? breakpoint
            : null,
          colors
        }));
      } else {
        return [
          {
            breakpoint: null,
            colors
          }
        ];
      }
    },
    typography(
      parent: {},
      { input, responsive }: Record<string, any>
    ): Array<CSSBuilderTypographyBase> {
      const typographyInput = input as {
        sizes?: Array<{ name: string; cssValue: string }>;
        tailwindCSSVersion?: string;
      };

      let sizes: Array<{ name: string; cssValue: string }> = [];

      if (typographyInput.sizes) {
        sizes = sizes.concat(typographyInput.sizes);
      }

      if (typographyInput.tailwindCSSVersion === "1.0") {
        sizes = sizes.concat(tailwindTextSizes());
      }

      if (responsive) {
        return Object.keys(responsiveMediaQueries).map(breakpoint => ({
          breakpoint: (responsiveMediaQueries as Record<string, string | null>)[
            breakpoint
          ]
            ? breakpoint
            : null,
          sizes
        }));
      } else {
        return [
          {
            breakpoint: null,
            sizes
          }
        ];
      }
    }
  },
  CSSBuilderColors: {
    mediaQuery: reusableResolvers.mediaQuery,
    textClasses(
      parent: CSSBuilderColorBase,
      { prefix }: Record<string, any>
    ): Array<CSSBuilderSelector> {
      const breakpointPrefix = parent.breakpoint
        ? `${parent.breakpoint}\\:`
        : "";

      return parent.colors.map(colorInput => ({
        selector: `.${breakpointPrefix}${prefix}${colorInput.name}`,
        rules: [
          {
            property: "color",
            value: colorInput.rgb
          }
        ]
      }));
    },
    backgroundClasses(
      parent: CSSBuilderColorBase,
      { prefix }: Record<string, any>
    ): Array<CSSBuilderSelector> {
      const breakpointPrefix = parent.breakpoint
        ? `${parent.breakpoint}\\:`
        : "";

      return parent.colors.map(colorInput => ({
        selector: `.${breakpointPrefix}${prefix}${colorInput.name}`,
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
    mediaQuery: reusableResolvers.mediaQuery,
    sizeClasses(
      parent: CSSBuilderTypographyBase,
      { prefix }: Record<string, any>
    ): Array<CSSBuilderSelector> {
      const breakpointPrefix = parent.breakpoint
        ? `${parent.breakpoint}\\:`
        : "";

      return parent.sizes.map(sizeInput => ({
        selector: `.${breakpointPrefix}${prefix}${sizeInput.name}`,
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
