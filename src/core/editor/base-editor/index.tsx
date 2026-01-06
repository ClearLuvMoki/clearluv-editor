import "@/styles/globals.css";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import clsx from "clsx";
import { useMemo } from "react";
import { Extensions } from "./extensions";
import type { BaseEditorProps } from "./types";

export function BaseEditor(props?: BaseEditorProps) {
  const {
    autofocus,
    content = "",
    extensions = [],
    contentType,
    classNames,
    onUpdate,
    children,
  } = props || {};
  const editor = useEditor(
    {
      extensions: Array.from(new Set([...Extensions, ...extensions])),
      autofocus,
      content,
      contentType,
      onUpdate,
    },
    [autofocus, content, contentType],
  );

  const providerValue = useMemo(() => ({ editor }), [editor]);

  return (
    <EditorContext.Provider value={providerValue}>
      <EditorContent
        editor={editor}
        data-type="moki-editor"
        className={clsx("moki-editor", classNames?.editor)}
      >
        {children}
      </EditorContent>
    </EditorContext.Provider>
  );
}
