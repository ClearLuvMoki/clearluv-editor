import type { Editor } from "@tiptap/core";
import type { Node } from "@tiptap/pm/model";
import { PlusIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { canInsertSlashCommand, insertSlashCommand } from "@/lib/utils";

export interface UseSlashCommandTriggerConfig {
  editor?: Editor | null;
  node?: Node | null;
  nodePos?: number | null;
  trigger?: string;
  hideWhenUnavailable?: boolean;
  onTriggered?: (trigger: string) => void;
}

export function shouldShowButton(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
  node?: Node | null;
  nodePos?: number | null;
}): boolean {
  const { editor, hideWhenUnavailable, node, nodePos } = props;

  if (!editor || !editor.isEditable) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canInsertSlashCommand(editor, node, nodePos);
  }

  return true;
}

export function useSlashCommandTrigger(config?: UseSlashCommandTriggerConfig) {
  const {
    editor: providedEditor,
    node,
    nodePos,
    trigger = "/",
    hideWhenUnavailable = false,
    onTriggered,
  } = config || {};

  const { editor } = useTiptapEditor(providedEditor);
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const canInsert = canInsertSlashCommand(editor, node, nodePos);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, hideWhenUnavailable, node, nodePos }));
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable, node, nodePos]);

  const handleSlashCommand = useCallback(() => {
    if (!editor) return false;

    const success = insertSlashCommand(editor, trigger, node, nodePos);
    if (success) {
      onTriggered?.(trigger);
    }
    return success;
  }, [editor, trigger, node, nodePos, onTriggered]);

  return {
    isVisible,
    handleSlashCommand,
    canInsert,
    label: "Insert block",
    trigger,
    Icon: PlusIcon,
  };
}
