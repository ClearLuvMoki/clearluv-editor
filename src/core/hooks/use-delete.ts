import type { Editor } from "@tiptap/core";
import { TrashIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { canDeleteNode, deleteNode } from "@/lib/utils";

export interface UseDeleteNodeConfig {
  editor?: Editor | null;
  hideWhenUnavailable?: boolean;
  onDeleted?: () => void;
}

export function shouldShowButton(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, hideWhenUnavailable } = props;

  if (!editor || !editor.isEditable) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canDeleteNode(editor);
  }

  return true;
}

export function useDeleteNode(config?: UseDeleteNodeConfig) {
  const { editor: providedEditor, hideWhenUnavailable = false, onDeleted } = config || {};

  const { editor } = useTiptapEditor(providedEditor);
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const canDeleteNodeState = canDeleteNode(editor);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, hideWhenUnavailable }));
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  const handleDeleteNode = useCallback(() => {
    if (!editor) return false;

    const success = deleteNode(editor);
    if (success) {
      onDeleted?.();
    }
    return success;
  }, [editor, onDeleted]);

  return {
    isVisible,
    handleDeleteNode,
    canDeleteNode: canDeleteNodeState,
    label: "Delete",
    Icon: TrashIcon,
  };
}
