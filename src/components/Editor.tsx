"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import { TextStyle } from "@tiptap/extension-text-style";
import { useEffect } from "react";
import Toolbar from "./Toolbar";

type Props = {
  content: string;
  onChange: (html: string) => void;
  editable: boolean;
};

export default function Editor({ content, onChange, editable }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Start typing your document…" }),
      Highlight.configure({ multicolor: false }),
      Typography,
      TextStyle,
    ],
    content,
    editable,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none focus:outline-none min-h-[60vh] py-8",
      },
    },
    immediatelyRender: false,
  });

  // Sync content from outside (e.g. initial load)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (content !== current) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Sync editable flag
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editable, editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-col">
      {editable && <Toolbar editor={editor} />}
      <div className={`px-2 ${!editable ? "opacity-75" : ""}`}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
