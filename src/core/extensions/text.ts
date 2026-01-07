import type { Editor } from "@tiptap/core";
import { Pilcrow } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { shouldShowButton } from "@/extensions/color/use-color-highlight";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { canToggleText, isParagraphActive, toggleParagraph } from "@/lib/utils";

export { Text } from "@tiptap/extension-text";

export interface UseTextConfig {
  editor?: Editor | null;
  hideWhenUnavailable?: boolean;
  onToggled?: () => void;
}

export function useText(config?: UseTextConfig) {
  const { editor: providedEditor, hideWhenUnavailable = false, onToggled } = config || {};

  const { editor } = useTiptapEditor(providedEditor);
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const canToggle = canToggleText(editor);
  const isActive = isParagraphActive(editor);

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

  const handleToggle = useCallback(() => {
    if (!editor) return false;

    const success = toggleParagraph(editor);
    if (success) {
      onToggled?.();
    }
    return success;
  }, [editor, onToggled]);

  return {
    isVisible,
    isActive,
    handleToggle,
    canToggle,
    label: "Text",
    icon: Pilcrow,
  };
}
