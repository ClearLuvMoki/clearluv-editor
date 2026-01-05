import { DragContextMenu } from "@/components/drag-context-menu";
import { Slash } from "@/components/slash";
import type { NotionEditorProps } from "@/domains/types/notion-editor";
import { BaseEditor } from "@/editor";
import {
  Blockquote,
  BulletList,
  Code,
  CodeBlock,
  Dropcursor,
  HardBreak,
  Heading,
  History,
  Link,
  ListItem,
  OrderedList,
  TaskItem,
  TaskList,
  TrailingNode,
  UiState,
} from "@/extensions";

export function NotionEditor(props?: NotionEditorProps) {
  return (
    <BaseEditor
      classNames={{
        editor: "moki-notion-editor",
      }}
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
      ]}
      {...props}
    >
      <DragContextMenu />
      <Slash />
    </BaseEditor>
  );
}
