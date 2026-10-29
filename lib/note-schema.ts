import { getSchema } from "@tiptap/core";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { z } from "zod";
import { editorExtensions } from "@/lib/editor-extensions";

const editorSchema = getSchema(editorExtensions);

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 100_000;
const MAX_DEPTH = 20;

const NODE_TYPES = [
  "paragraph",
  "heading",
  "bulletList",
  "listItem",
  "codeBlock",
  "horizontalRule",
  "hardBreak",
  "text",
] as const;

// Only the formatting the editor offers (SPEC 3.3); anything else is rejected.
export type TiptapNode = {
  type: (typeof NODE_TYPES)[number];
  attrs?: { level?: number; language?: string | null };
  content?: TiptapNode[];
  text?: string;
  marks?: { type: "bold" | "italic" | "code" }[];
};

const nodeSchema: z.ZodType<TiptapNode> = z.lazy(() =>
  z.strictObject({
    type: z.enum(NODE_TYPES),
    attrs: z
      .strictObject({
        level: z.number().int().min(1).max(3).optional(),
        language: z.string().max(50).nullable().optional(),
      })
      .optional(),
    content: z.array(nodeSchema).optional(),
    text: z.string().optional(),
    marks: z.array(z.strictObject({ type: z.enum(["bold", "italic", "code"]) })).optional(),
  }),
);

const docSchema = z.strictObject({
  type: z.literal("doc"),
  content: z.array(nodeSchema).optional(),
});

export type TiptapDoc = z.infer<typeof docSchema>;

// Iterative so that a hostile, deeply nested payload cannot overflow the stack.
function exceedsMaxDepth(root: unknown): boolean {
  const stack: [unknown, number][] = [[root, 1]];
  while (stack.length > 0) {
    const [node, depth] = stack.pop()!;
    if (depth > MAX_DEPTH) return true;
    const children = (node as { content?: unknown } | null)?.content;
    if (Array.isArray(children)) for (const child of children) stack.push([child, depth + 1]);
  }
  return false;
}

export const createNoteSchema = z.object({
  // Counts UTF-16 code units, the same unit as the input's `maxLength`.
  title: z
    .string()
    .trim()
    .refine((title) => title.length <= MAX_TITLE_LENGTH, `Title must be at most ${MAX_TITLE_LENGTH} characters`),
  content: z
    .string()
    .max(MAX_CONTENT_LENGTH, "Note is too long")
    .transform((raw, ctx) => {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (!exceedsMaxDepth(parsed)) {
          // Rejects shapes the editor cannot load (e.g. text directly under doc, empty text nodes).
          ProseMirrorNode.fromJSON(editorSchema, parsed).check();
          return parsed;
        }
      } catch {
        // fall through to the issue below
      }
      ctx.issues.push({ code: "custom", message: "Note content is invalid", input: raw });
      return z.NEVER;
    })
    .pipe(docSchema),
});

// Note ids are server-generated UUIDs (lib/notes.ts).
export const deleteNoteSchema = z.object({
  id: z.uuid(),
  currentPath: z.string().max(500).optional(),
});
