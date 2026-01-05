import type { JSONContent } from "@tiptap/core";
import type { Editor } from "@tiptap/react";

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
  onUpdate?: ({
    json,
    html,
    text,
  }: {
    json: JSONContent;
    text: string;
    html: string;
    isEmpty: boolean;
  }) => void;
  autofocus?: "start" | "end" | "all" | number | boolean | null;
  extensions?: any[];
  children?: ReactNode;
}

export interface BaseEditorInstance {
  instance: any;
  addExtensions: (extensions: any[]) => void;
}
