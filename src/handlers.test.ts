import { handleRequestThrowing } from "./handlers";

async function queryCSS(query: string): Promise<string> {
  const res = await handleRequestThrowing({
    url: `http://localhost/1/graphql.css?query=${encodeURIComponent(query)}`
  } as Request);

  return await res.text();
}

async function queryCSSTS(query: string): Promise<string> {
  const res = await handleRequestThrowing({
    url: `http://localhost/1/graphql.css.ts?query=${encodeURIComponent(query)}`
  } as Request);

  return await res.text();
}

describe("graphql.css", () => {
  describe("colors", () => {
    test("provided palette", async () => {
      const css = await queryCSS(`
  {
    buildCSS {
      colors(input: {
        palette: [
          {name: "grey-400", rgb: "#B8C2CC" },
          {name: "grey-100", rgb: "#eee" }
        ]
      }) {
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
    }
  }
  `);
      expect(css).toEqual(
        `.text-grey-400 { color: #B8C2CC; }
.text-grey-100 { color: #eee; }
.bg-grey-400 { background-color: #B8C2CC; }
.bg-grey-100 { background-color: #eee; }`
      );
    });

    test("provided palette with responsive true", async () => {
      const css = await queryCSS(`
      {
        buildCSS {
          colors(responsive: true, input: {
            palette: [
              {name: "grey-400", rgb: "#B8C2CC" },
              {name: "grey-100", rgb: "#eee" }
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
        }
      }
      `);
      expect(css).toEqual(
        `.text-grey-400 { color: #B8C2CC; }
.text-grey-100 { color: #eee; }
.bg-grey-400 { background-color: #B8C2CC; }
.bg-grey-100 { background-color: #eee; }

@media (min-width: 576px) {
.sm\\:text-grey-400 { color: #B8C2CC; }
.sm\\:text-grey-100 { color: #eee; }
.sm\\:bg-grey-400 { background-color: #B8C2CC; }
.sm\\:bg-grey-100 { background-color: #eee; }
}

@media (min-width: 768px) {
.md\\:text-grey-400 { color: #B8C2CC; }
.md\\:text-grey-100 { color: #eee; }
.md\\:bg-grey-400 { background-color: #B8C2CC; }
.md\\:bg-grey-100 { background-color: #eee; }
}

@media (min-width: 992px) {
.lg\\:text-grey-400 { color: #B8C2CC; }
.lg\\:text-grey-100 { color: #eee; }
.lg\\:bg-grey-400 { background-color: #B8C2CC; }
.lg\\:bg-grey-100 { background-color: #eee; }
}

@media (min-width: 1200px) {
.xl\\:text-grey-400 { color: #B8C2CC; }
.xl\\:text-grey-100 { color: #eee; }
.xl\\:bg-grey-400 { background-color: #B8C2CC; }
.xl\\:bg-grey-100 { background-color: #eee; }
}
`
      );
    });
  });

  describe("typography", () => {
    test("provided sizes", async () => {
      const css = await queryCSS(`
  {
    buildCSS {
      typography(input: {
        sizes: [
          {name: "xs", cssValue: "0.75rem" },
          {name: "base", cssValue: "1rem" },
          {name: "double", cssValue: "200%" }
        ]
      }) {
        sizeClasses(prefix: "text-") {
          selector
          rules {
            property, value
          }
        }
      }
    }
  }
  `);
      expect(css).toEqual(
        `.text-xs { font-size: 0.75rem; }
.text-base { font-size: 1rem; }
.text-double { font-size: 200%; }`
      );
    });

    test("provided sizes with responsive true", async () => {
      const css = await queryCSS(`
      {
        buildCSS {
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
      `);
      expect(css).toEqual(
        `.text-xs { font-size: 0.75rem; }
.text-base { font-size: 1rem; }
.text-double { font-size: 200%; }

@media (min-width: 576px) {
.sm\\:text-xs { font-size: 0.75rem; }
.sm\\:text-base { font-size: 1rem; }
.sm\\:text-double { font-size: 200%; }
}

@media (min-width: 768px) {
.md\\:text-xs { font-size: 0.75rem; }
.md\\:text-base { font-size: 1rem; }
.md\\:text-double { font-size: 200%; }
}

@media (min-width: 992px) {
.lg\\:text-xs { font-size: 0.75rem; }
.lg\\:text-base { font-size: 1rem; }
.lg\\:text-double { font-size: 200%; }
}

@media (min-width: 1200px) {
.xl\\:text-xs { font-size: 0.75rem; }
.xl\\:text-base { font-size: 1rem; }
.xl\\:text-double { font-size: 200%; }
}
`
      );
    });

    describe.skip("TypeScript generation", () => {
      test("provided sizes with responsive true", async () => {
        const ts = await queryCSSTS(`
        {
          buildCSSTypeScriptDefinitions {
            typography(responsive: true, input: {
              sizes: [
                {name: "xs", cssValue: "0.75rem" },
                {name: "base", cssValue: "1rem" },
                {name: "double", cssValue: "200%" }
              ]
            }) {
              function(name: "text", prefix: "text-", for: [SIZES]) {
                typeScriptSource
              }
            }
          }
        }
        `);
        expect(ts).toEqual(
          `type TextSize = "xs" | "base" | "double";
type TextSuffix = TextSize;
function text(suffixes: ...Array<TextSuffix>): string {
  return suffixes.map(suffix => \`text-\${suffix}\`).join(" ");
}
text.sm = function textSm(suffixes: ...Array<TextSuffix>): string {
  return suffixes.map(suffix => \`sm:\\text-\${suffix}\`).join(" ");
}
text.md = function textMd(suffixes: ...Array<TextSuffix>): string {
  return suffixes.map(suffix => \`md:\\text-\${suffix}\`).join(" ");
}
text.lg = function textLg(suffixes: ...Array<TextSuffix>): string {
  return suffixes.map(suffix => \`lg:\\text-\${suffix}\`).join(" ");
}
text.xl = function textXl(suffixes: ...Array<TextSuffix>): string {
  return suffixes.map(suffix => \`xl:\\text-\${suffix}\`).join(" ");
}
`
        );
      });
    });
  });
});
