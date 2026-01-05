import type { EditorEvents } from "@tiptap/core";
import type { Editor } from "@tiptap/react";
import type { ReactNode } from "react";

export interface BaseEditorProps {
  editor?: Editor;
  theme?: "light" | "dark";
  classNames?: {
    root?: string;
    editor?: string;
  };
  styles?: {
    root?: React.CSSProperties;
    editor?: React.CSSProperties;
  };
  content?: string;
  onUpdate?: (data: EditorEvents["update"]) => void;
  autofocus?: "start" | "end" | "all" | number | boolean | null;
  extensions?: any[];
  children?: ReactNode;
}
