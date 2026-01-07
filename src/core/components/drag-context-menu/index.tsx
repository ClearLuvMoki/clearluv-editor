import "./index.css";
import { offset } from "@floating-ui/react";
import DragHandle from "@tiptap/extension-drag-handle-react";
import type { Node as TiptapNode } from "@tiptap/pm/model";
import { GripVertical } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SlashAction } from "@/components/drag-context-menu/slash-action";

import { DropdownColor } from "@/components/drop-menu/color";
import { DropdownDelete } from "@/components/drop-menu/delete";
import { DropdownDuplicate } from "@/components/drop-menu/duplicate";
import { DropdownTurnInto } from "@/components/drop-menu/turn-into";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useMenuActionVisibility } from "@/hooks/drag-context-menu-hooks";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { useUiEditorState } from "@/hooks/use-ui-editor-state";
import type { DragContextMenuProps, NodeChangeData } from "./types";

export function DragContextMenu({
  editor: providedEditor,
  withSlashCommandTrigger = true,
  mobileBreakpoint = 768,
  ...props
}: DragContextMenuProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const { isDragging } = useUiEditorState(editor);
  const [open, setOpen] = useState(false);
  const [node, setNode] = useState<TiptapNode | null>(null);
  const [nodePos, setNodePos] = useState<number>(-1);

  const { hasColorActions, hasTransformActions, hasAnyActionGroups } =
    useMenuActionVisibility(editor);

  useEffect(() => {
    if (!editor) return;
    editor.commands.setLockDragHandle(open);
    editor.commands.setMeta("lockDragHandle", open);
  }, [editor, open]);

  const handleNodeChange = useCallback((data: NodeChangeData) => {
    if (data.node) setNode(data.node);
    setNodePos(data.pos);
  }, []);

  const dynamicPositions = useMemo(() => {
    return {
      middleware: [
        offset((props) => {
          const { rects } = props;
          const nodeHeight = rects.reference.height;
          const dragHandleHeight = rects.floating.height;
          const crossAxis = nodeHeight / 2 - dragHandleHeight / 2;
          return {
            mainAxis: 16,
            crossAxis: nodeHeight > 40 ? 0 : crossAxis,
          };
        }),
      ],
    };
  }, []);

  const onElementDragStart = useCallback(() => {
    if (!editor) return;
    editor.commands.setIsDragging(true);
  }, [editor]);

  const onElementDragEnd = useCallback(() => {
    if (!editor) return;
    editor.commands.setIsDragging(false);
  }, [editor]);

  if (!editor) return;

  return (
    <DragHandle
      editor={editor}
      onNodeChange={handleNodeChange}
      computePositionConfig={dynamicPositions}
      onElementDragStart={onElementDragStart}
      onElementDragEnd={onElementDragEnd}
      {...props}
    >
      <div className="flex gap-1 items-center justify-end w-15 ">
        <SlashAction />
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              style={{ width: 20 }}
              variant={"ghost"}
              size="icon-sm"
              onPointerDownCapture={(e) => {
                e.stopPropagation();
              }}
              onClick={() => setOpen(!open)}
            >
              <GripVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuLabel className="text-xs text-gray-400">Text</DropdownMenuLabel>
            {hasColorActions && <DropdownColor />}
            {hasTransformActions && <DropdownTurnInto />}
            {hasAnyActionGroups && <Separator orientation="horizontal" />}
            <DropdownDuplicate text="Duplicate node" />
            <DropdownDelete text="Delete node" />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </DragHandle>
  );
}
