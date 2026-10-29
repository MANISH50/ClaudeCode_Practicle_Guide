import StarterKit from "@tiptap/starter-kit";

// Only the formatting offered in the toolbar (SPEC 3.3). Shared by the editor and the
// server-side validator in lib/note-schema.ts, so the two cannot drift apart.
export const editorExtensions = [
  StarterKit.configure({
    blockquote: false,
    orderedList: false,
    strike: false,
    underline: false,
    link: false,
    heading: { levels: [1, 2, 3] },
  }),
];
