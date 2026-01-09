import { DragContextMenu } from "@/components/drag-context-menu";
import { TableCellHandleMenu } from "@/components/drop-menu/table-cell-handle";
import { NotionToolbarFloating } from "@/components/floating";
import { Slash } from "@/components/slash";
import { BaseEditor } from "@/editor";
import {
  BlockCode,
  Blockquote,
  BulletList,
  Code,
  Dropcursor,
  Emoji,
  HardBreak,
  Heading,
  History,
  Image,
  ImageUploadNode,
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
import { TableSelectionOverlay } from "@/extensions/table-handle/table-selection";
import { MAX_FILE_SIZE } from "@/lib/utils";
import type { NotionEditorProps } from "./types";

function _fileToBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // 包含 data:image/png;base64,...
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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
        BlockCode,
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
        Image,
        ImageUploadNode.configure({
          accept: "image/*",
          maxSize: MAX_FILE_SIZE,
          limit: 3,
          upload: async (file: File) => {
            const data = await _fileToBase64(file);
            return Promise.resolve(data as any);
          },
          onError: (error) => console.error("Upload failed:", error),
        }),
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
      <NotionToolbarFloating />
    </BaseEditor>
  );
}
