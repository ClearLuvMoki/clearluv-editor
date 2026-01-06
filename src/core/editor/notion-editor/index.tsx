import { DragContextMenu } from "@/components/drag-context-menu";
import { Slash } from "@/components/slash";
import { TableCellHandleMenu } from "@/components/table-cell-handle-menu";
import { BaseEditor } from "@/editor";
import {
  Blockquote,
  BulletList,
  Code,
  CodeBlock,
  Dropcursor,
  Emoji,
  HardBreak,
  Heading,
  History,
  Link,
  ListItem,
  Markdown,
  NodeAlignment,
  OrderedList,
  TableHandleExtension,
  TableKit,
  TaskItem,
  TaskList,
  TrailingNode,
  UiState,
} from "@/extensions";
import { TableSelectionOverlay } from "@/nodes/table-selection";
import type { NotionEditorProps } from "./types";

export function NotionEditor(props?: NotionEditorProps) {
  return (
    <BaseEditor
      classNames={{
        editor: "moki-notion-editor",
      }}
      contentType={"markdown"}
      extensions={[
        Heading,
        Code,
        Blockquote,
        OrderedList,
        BulletList,
        ListItem,
        TaskList,
        TaskItem,
        Link,
        CodeBlock,
        History,
        HardBreak,
        TrailingNode,
        UiState,
        Dropcursor,
        Emoji,
        TableKit.configure({
          table: {
            resizable: true,
            cellMinWidth: 120,
          },
        }),
        TableHandleExtension,
        NodeAlignment,
        Markdown,
      ]}
      {...props}
    >
      <DragContextMenu />
      <Slash />
      <TableSelectionOverlay
        showResizeHandles={true}
        cellMenu={(props) => (
          <TableCellHandleMenu
            editor={props.editor}
            onMouseDown={(e) => props.onResizeStart?.("br")(e)}
          />
        )}
      />
    </BaseEditor>
  );
}
