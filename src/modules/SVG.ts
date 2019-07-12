import parseXml from "@rgrove/parse-xml";

type SVGDocument = {
  readonly document: parseXml.Document;
};

export function parseSVGDocument(source: string): SVGDocument {
  return {
    document: parseXml(source)
  };
}

function visitXMLNodes(nodes: Array<parseXml.NodeBase>, f: (node: parseXml.Node) => void) {
  (nodes as Array<parseXml.Node>).forEach((node) => {
    f(node);

    if (node.type === "element") {
      visitXMLNodes(node.children, f);
    }
  });
}

export function listAllFillsFromSVGDocument(svg: SVGDocument): Array<string> {
  const fills: Array<string> = [];
  visitXMLNodes(svg.document.children, (node) => {
    if (node.type === "element") {
      const fill = node.attributes["fill"];
      if (fill !== undefined) {
        fills.push(fill);
      }
    }
  });
  return fills;
}
