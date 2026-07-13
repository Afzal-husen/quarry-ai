import { describe, it, expect } from "vitest";
import React from "react";
import { parseMarkdown } from "../markdown-parser";

function getTextContent(node: React.ReactNode): string {
  if (!node) return "";
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(getTextContent).join("");
  }
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    if (props && props.children) {
      return getTextContent(props.children);
    }
  }
  return "";
}

// Helper to render React nodes to simple HTML-like structures for easy testing
function renderNodesToString(nodes: React.ReactNode[]): string {
  const container = document.createElement("div");
  nodes.forEach((node) => {
    if (!node) return;
    if (typeof node === "string") {
      container.appendChild(document.createTextNode(node));
    } else if (React.isValidElement(node)) {
      const el = document.createElement(node.type as string);
      const props = node.props as { className?: string; start?: number; children?: React.ReactNode };
      if (props.className) el.className = props.className;
      if (props.start !== undefined) el.setAttribute("start", String(props.start));
      
      if (props.children) {
        if (Array.isArray(props.children)) {
          el.innerHTML = (props.children as React.ReactNode[])
            .map((c: React.ReactNode) => {
              if (React.isValidElement(c)) {
                const tag = typeof c.type === "string" ? c.type : "span";
                return `<${tag}>${getTextContent(c)}</${tag}>`;
              }
              return String(c);
            })
            .join("");
        } else {
          el.textContent = getTextContent(props.children);
        }
      }
      container.appendChild(el);
    }
  });
  return container.innerHTML;
}

describe("parseMarkdown Ordered List Numbering", () => {
  const mockRenderCitation = (index: number) => `[${index}]`;

  it("should preserve standard list numbering sequentially when parsed in a block", () => {
    const markdown = "1. First Item\n2. Second Item\n3. Third Item";
    const result = parseMarkdown(markdown, mockRenderCitation);
    const html = renderNodesToString(result);
    expect(html).toContain('start="1"');
    expect(html).toContain("<li>First Item</li>");
    expect(html).toContain("<li>Second Item</li>");
  });

  it("should parse list start index from split list structures", () => {
    const markdown = "1. Understand and Believe the Concept\n\nSome paragraph text here.\n\n3. Identify the Priority That Matters Most";
    const result = parseMarkdown(markdown, mockRenderCitation);
    const html = renderNodesToString(result);

    // Verify first list has start="1"
    expect(html).toContain('start="1"');
    expect(html).toContain("<li>Understand and Believe the Concept</li>");

    // Verify middle paragraph is parsed
    expect(html).toContain("Some paragraph text here.");

    // Verify second list starts at 3
    expect(html).toContain('start="3"');
    expect(html).toContain("<li>Identify the Priority That Matters Most</li>");
  });
});
