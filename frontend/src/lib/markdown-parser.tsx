import React from "react";

export type RenderCitationFn = (index: number) => React.ReactNode;

/**
 * Parses a string containing inline Markdown (bold, italic, inline code, and citations)
 * and maps it into a React node array.
 */
export function parseInlineMarkdown(
  text: string,
  onRenderCitation: RenderCitationFn
): React.ReactNode[] {
  // Regex to split by inline markers:
  // - Inline Code: `code`
  // - Bold: **text**
  // - Italic: *text*
  // - Citation token: [number]
  const inlineRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[\d+\])/g;
  const parts = text.split(inlineRegex);

  return parts.map((part, index) => {
    // 1. Inline Code
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded bg-muted border border-border text-xs font-mono text-indigo-400 select-text"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    // 2. Bold
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong
          key={index}
          className="font-extrabold text-foreground select-text"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    // 3. Italic
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={index} className="italic text-foreground select-text">
          {part.slice(1, -1)}
        </em>
      );
    }
    // 4. Citation
    const citationMatch = part.match(/^\[(\d+)\]$/);
    if (citationMatch) {
      const idx = parseInt(citationMatch[1], 10);
      return <React.Fragment key={index}>{onRenderCitation(idx)}</React.Fragment>;
    }
    // 5. Regular text
    return <span key={index} className="select-text">{part}</span>;
  });
}

/**
 * Parses block-level Markdown elements (headers, code blocks, bullet/numbered lists,
 * tables, blockquotes, horizontal rules, and paragraphs) into React elements.
 */
export function parseMarkdown(
  content: string,
  onRenderCitation: RenderCitationFn
): React.ReactNode[] {
  if (!content) return [];

  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // 1. Code Block (```lang ... ```)
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      let code = "";
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code += lines[i] + "\n";
        i++;
      }
      blocks.push(
        <pre
          key={`code-block-${i}`}
          className="bg-muted/80 border border-border p-3.5 rounded-lg my-2 overflow-x-auto text-xs font-mono select-text text-foreground bg-neutral-900/60"
        >
          {lang && (
            <div className="text-[9px] uppercase font-bold text-muted-foreground mb-1 select-none border-b border-border/20 pb-1">
              {lang}
            </div>
          )}
          <code>{code.trim()}</code>
        </pre>
      );
      i++; // skip closing ```
      continue;
    }

    // 2. Headers (# Header)
    if (line.startsWith("#")) {
      const match = line.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2];
        const children = parseInlineMarkdown(text, onRenderCitation);
        const key = `h-${i}`;
        if (level === 1) {
          blocks.push(
            <h1 key={key} className="text-xl font-extrabold text-foreground mt-4 mb-2">
              {children}
            </h1>
          );
        } else if (level === 2) {
          blocks.push(
            <h2 key={key} className="text-lg font-bold text-foreground mt-3.5 mb-2">
              {children}
            </h2>
          );
        } else if (level === 3) {
          blocks.push(
            <h3 key={key} className="text-md font-bold text-foreground mt-3 mb-1.5">
              {children}
            </h3>
          );
        } else {
          blocks.push(
            <h4 key={key} className="text-sm font-semibold text-foreground mt-2 mb-1">
              {children}
            </h4>
          );
        }
        i++;
        continue;
      }
    }

    // 3. Horizontal Rule (---)
    if (line.trim() === "---" || line.trim() === "***" || line.trim() === "___") {
      blocks.push(<hr key={`hr-${i}`} className="border-t border-border my-4" />);
      i++;
      continue;
    }

    // 4. Blockquotes (> quote)
    if (line.trim().startsWith(">")) {
      let quote = "";
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quote += lines[i].trim().slice(1).trim() + "\n";
        i++;
      }
      blocks.push(
        <blockquote
          key={`quote-${i}`}
          className="border-l-4 border-indigo-500 bg-muted/20 pl-4 py-1.5 my-2.5 text-sm text-muted-foreground italic rounded-r-lg"
        >
          {parseMarkdown(quote.trim(), onRenderCitation)}
        </blockquote>
      );
      continue;
    }

    // 5. Lists (Bullet & Numbered)
    const isUnordered = (l: string) => /^\s*[\*\+-]\s+(.*)$/.test(l);
    const isOrdered = (l: string) => /^\s*\d+\.\s+(.*)$/.test(l);

    if (isUnordered(line)) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && isUnordered(lines[i])) {
        const match = lines[i].match(/^\s*[\*\+-]\s+(.*)$/);
        if (match) {
          listItems.push(
            <li key={`li-${i}`} className="leading-relaxed">
              {parseInlineMarkdown(match[1], onRenderCitation)}
            </li>
          );
        }
        i++;
      }
      blocks.push(
        <ul key={`ul-${i}`} className="list-disc pl-5 my-2 text-sm space-y-1 text-muted-foreground">
          {listItems}
        </ul>
      );
      continue;
    }

    if (isOrdered(line)) {
      const listItems: React.ReactNode[] = [];
      let startValue = 1;
      let isFirst = true;
      while (i < lines.length && isOrdered(lines[i])) {
        const match = lines[i].match(/^\s*(\d+)\.\s+(.*)$/);
        if (match) {
          if (isFirst) {
            startValue = parseInt(match[1], 10);
            isFirst = false;
          }
          listItems.push(
            <li key={`li-${i}`} className="leading-relaxed">
              {parseInlineMarkdown(match[2], onRenderCitation)}
            </li>
          );
        }
        i++;
      }
      blocks.push(
        <ol key={`ol-${i}`} start={startValue} className="list-decimal pl-5 my-2 text-sm space-y-1 text-muted-foreground">
          {listItems}
        </ol>
      );
      continue;
    }

    // 6. Tables
    const isTableSeparator = (l: string) =>
      /^\s*\|?\s*(:?-+:?)\s*(\|\s*(:?-+:?)\s*)*\|?\s*$/.test(l);
    const isTableRow = (l: string) => l.trim().startsWith("|") && l.trim().endsWith("|");

    if (isTableRow(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const headersList = line
        .slice(1, -1)
        .split("|")
        .map((cell) => cell.trim());
      i += 2; // skip header and separator
      const rowsList: string[][] = [];
      while (i < lines.length && isTableRow(lines[i])) {
        const cells = lines[i]
          .slice(1, -1)
          .split("|")
          .map((cell) => cell.trim());
        rowsList.push(cells);
        i++;
      }
      blocks.push(
        <div
          key={`table-wrapper-${i}`}
          className="overflow-x-auto my-3.5 border border-border rounded-lg bg-card text-xs text-foreground max-w-full"
        >
          <table className="min-w-full divide-y divide-border table-auto">
            <thead className="bg-muted/40">
              <tr>
                {headersList.map((header, hIdx) => (
                  <th
                    key={`th-${hIdx}`}
                    className="px-4 py-2 text-left font-bold text-muted-foreground border-r border-border last:border-r-0 select-text"
                  >
                    {parseInlineMarkdown(header, onRenderCitation)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {rowsList.map((row, rIdx) => (
                <tr key={`tr-${rIdx}`} className="hover:bg-muted/20">
                  {row.map((cell, cIdx) => (
                    <td
                      key={`td-${cIdx}`}
                      className="px-4 py-2 border-r border-border last:border-r-0 select-text"
                    >
                      {parseInlineMarkdown(cell, onRenderCitation)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // 7. Normal Paragraph
    if (line.trim()) {
      blocks.push(
        <p key={`p-${i}`} className="my-1.5 leading-relaxed text-sm select-text text-foreground/90">
          {parseInlineMarkdown(line, onRenderCitation)}
        </p>
      );
    }
    i++;
  }

  return blocks;
}
