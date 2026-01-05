import type { DragHandleProps } from "@tiptap/extension-drag-handle-react";
import type { Node } from "@tiptap/pm/model";
import type { Editor } from "@tiptap/react";

export interface DragContextMenuProps extends Omit<DragHandleProps, "editor" | "children"> {
  editor?: Editor | null;
  withSlashCommandTrigger?: boolean;
  mobileBreakpoint?: number;
}

export interface NodeChangeData {
  node: Node | null;
  editor: Editor;
  pos: number;
}
