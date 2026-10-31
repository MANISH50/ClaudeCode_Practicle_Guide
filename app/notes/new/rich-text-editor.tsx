"use client";

import { EditorContent, useEditor, useEditorState, type Editor, type JSONContent } from "@tiptap/react";
import { useEffect } from "react";
import { editorExtensions } from "@/lib/editor-extensions";

const EDITOR_CLASS = [
  "min-h-80 px-5 py-4 text-[1.0625rem] leading-7 outline-none",
  "[&>*+*]:mt-3",
  "[&_:is(h1,h2,h3)]:font-display [&_:is(h1,h2,h3)]:font-semibold [&_:is(h1,h2,h3)]:leading-tight [&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl",
  "[&_ul]:list-disc [&_ul]:pl-6",
  "[&_code]:rounded-md [&_code]:bg-orange-600/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-accent",
  "[&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border [&_pre]:bg-foreground/[0.04] [&_pre]:p-4 [&_pre]:text-[0.9rem]",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-foreground",
  "[&_hr]:my-4 [&_hr]:border-border",
].join(" ");

const toolbarButtonClass =
  "min-w-9 rounded-lg px-2.5 py-1.5 text-[0.95rem] font-medium outline-none transition duration-150 hover:bg-orange-600/10 active:scale-90 focus-visible:ring-2 focus-visible:ring-orange-600 aria-pressed:bg-linear-to-br aria-pressed:from-orange-700 aria-pressed:to-orange-800 aria-pressed:text-white aria-pressed:shadow-sm";

type RichTextEditorProps = {
  labelId: string;
  describedById?: string;
  invalid?: boolean;
  initialDoc?: JSONContent;
  onChange: (json: string) => void;
};

function editorAttributes(labelId: string, describedById?: string, invalid?: boolean) {
  return {
    role: "textbox",
    "aria-multiline": "true",
    "aria-labelledby": labelId,
    ...(describedById && { "aria-describedby": describedById }),
    ...(invalid && { "aria-invalid": "true" }),
    class: EDITOR_CLASS,
  };
}

export function RichTextEditor({ labelId, describedById, invalid, initialDoc, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: editorExtensions,
    content: initialDoc,
    immediatelyRender: false, // avoids an SSR hydration mismatch
    shouldRerenderOnTransaction: false, // toolbar subscribes via useEditorState
    onUpdate: ({ editor }) => onChange(JSON.stringify(editor.getJSON())),
    editorProps: { attributes: editorAttributes(labelId, describedById, invalid) },
  });

  // Attributes are read once at creation; push changes (e.g. after a failed save).
  useEffect(() => {
    editor?.setOptions({ editorProps: { attributes: editorAttributes(labelId, describedById, invalid) } });
  }, [editor, labelId, describedById, invalid]);

  return (
    <div
      data-invalid={invalid || undefined}
      className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[inset_0_1px_2px_rgb(0_0_0/0.03)] transition duration-200 focus-within:border-orange-600 focus-within:ring-4 focus-within:ring-orange-600/20 data-invalid:border-red-500"
    >
      {editor ? (
        <>
          <Toolbar editor={editor} />
          <EditorContent editor={editor} />
        </>
      ) : (
        <div className="h-80 animate-pulse bg-foreground/5" aria-busy="true" />
      )}
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const active = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      h1: editor.isActive("heading", { level: 1 }),
      h2: editor.isActive("heading", { level: 2 }),
      h3: editor.isActive("heading", { level: 3 }),
      paragraph: editor.isActive("paragraph"),
      code: editor.isActive("code"),
      codeBlock: editor.isActive("codeBlock"),
      bulletList: editor.isActive("bulletList"),
    }),
  });

  const chain = () => editor.chain().focus();
  const buttons = [
    { label: "Bold", text: "B", pressed: active.bold, run: () => chain().toggleBold().run() },
    { label: "Italic", text: "I", pressed: active.italic, run: () => chain().toggleItalic().run() },
    { label: "Heading 1", text: "H1", pressed: active.h1, run: () => chain().toggleHeading({ level: 1 }).run() },
    { label: "Heading 2", text: "H2", pressed: active.h2, run: () => chain().toggleHeading({ level: 2 }).run() },
    { label: "Heading 3", text: "H3", pressed: active.h3, run: () => chain().toggleHeading({ level: 3 }).run() },
    { label: "Normal text", text: "P", pressed: active.paragraph, run: () => chain().setParagraph().run() },
    { label: "Inline code", text: "</>", pressed: active.code, run: () => chain().toggleCode().run() },
    { label: "Code block", text: "{ }", pressed: active.codeBlock, run: () => chain().toggleCodeBlock().run() },
    { label: "Bullet list", text: "• List", pressed: active.bulletList, run: () => chain().toggleBulletList().run() },
    { label: "Horizontal separator", text: "—", pressed: false, run: () => chain().setHorizontalRule().run() },
  ];

  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      className="flex flex-wrap gap-1 border-b border-border bg-background/60 p-2"
    >
      {buttons.map(({ label, text, pressed, run }) => (
        <button
          key={label}
          type="button"
          aria-label={label}
          title={label}
          aria-pressed={pressed}
          // Keep focus and the text selection in the editor when a button is clicked.
          onMouseDown={(event) => event.preventDefault()}
          onClick={run}
          className={toolbarButtonClass}
        >
          {text}
        </button>
      ))}
    </div>
  );
}
