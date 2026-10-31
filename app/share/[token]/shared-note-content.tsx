import type { ReactNode } from "react";
import type { TiptapNode } from "@/lib/note-schema";

// Renders the saved TipTap document as React elements, so no raw HTML is injected.
// Node and mark types are already limited to the editor's set by lib/note-schema.ts.
export function SharedNoteContent({ nodes }: { nodes: TiptapNode[] }) {
  return <div className="flex flex-col gap-4 leading-relaxed">{nodes.map(renderNode)}</div>;
}

function renderNode(node: TiptapNode, index: number): ReactNode {
  const children = node.content?.map(renderNode);

  switch (node.type) {
    case "paragraph":
      return <p key={index}>{children}</p>;
    case "heading": {
      const level = node.attrs?.level ?? 1;
      if (level === 1)
        return (
          <h1 key={index} className="heading text-3xl">
            {children}
          </h1>
        );
      if (level === 2)
        return (
          <h2 key={index} className="heading text-2xl">
            {children}
          </h2>
        );
      return (
        <h3 key={index} className="heading text-xl">
          {children}
        </h3>
      );
    }
    case "bulletList":
      return (
        <ul key={index} className="list-disc pl-6">
          {children}
        </ul>
      );
    case "listItem":
      return <li key={index}>{children}</li>;
    case "codeBlock":
      return (
        <pre key={index} className="overflow-x-auto rounded-xl bg-border/40 p-4 font-mono text-sm">
          <code>{children}</code>
        </pre>
      );
    case "horizontalRule":
      return <hr key={index} className="border-border" />;
    case "hardBreak":
      return <br key={index} />;
    case "text":
      return applyMarks(node, index);
  }
}

function applyMarks(node: TiptapNode, index: number): ReactNode {
  let content: ReactNode = node.text ?? "";
  for (const mark of node.marks ?? []) {
    if (mark.type === "code")
      content = (
        <code key={index} className="rounded-md bg-border/40 px-1.5 py-0.5 font-mono text-[0.9em]">
          {content}
        </code>
      );
    if (mark.type === "bold") content = <strong key={index}>{content}</strong>;
    if (mark.type === "italic") content = <em key={index}>{content}</em>;
  }
  return <span key={index}>{content}</span>;
}
