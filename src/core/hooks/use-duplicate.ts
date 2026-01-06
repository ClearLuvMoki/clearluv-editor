import type { Editor } from "@tiptap/core";
import { CopyIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { canDuplicateNode, duplicateNode } from "@/lib/utils";

export interface UseDuplicateConfig {
  editor?: Editor | null;
  hideWhenUnavailable?: boolean;
  onDuplicated?: () => void;
}

export function shouldShowButton(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, hideWhenUnavailable } = props;

  if (!editor || !editor.isEditable) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canDuplicateNode(editor);
  }

  return true;
}

export function useDuplicate(config?: UseDuplicateConfig) {
  const { editor: providedEditor, hideWhenUnavailable = false, onDuplicated } = config || {};

  const { editor } = useTiptapEditor(providedEditor);
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const canDuplicate = canDuplicateNode(editor);

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

  const handleDuplicate = useCallback(() => {
    if (!editor) return false;

    const success = duplicateNode(editor);
    if (success) {
      onDuplicated?.();
    }
    return success;
  }, [editor, onDuplicated]);

  return {
    isVisible,
    handleDuplicate,
    canDuplicate,
    label: "Duplicate node",
    Icon: CopyIcon,
  };
}
