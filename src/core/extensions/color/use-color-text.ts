import type { Editor } from "@tiptap/core";
import { useCallback, useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { canColorText, isColorTextActive, shouldShowButton } from "./use-color-highlight";

export interface UseColorTextConfig {
  editor?: Editor | null;
  textColor: string;
  label: string;
  hideWhenUnavailable?: boolean;
  onApplied?: ({ color, label }: { color: string; label: string }) => void;
}

export function useColorText(config: UseColorTextConfig) {
  const {
    editor: providedEditor,
    label,
    textColor,
    hideWhenUnavailable = false,
    onApplied,
  } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const canColorTextState = canColorText(editor);
  const isActive = isColorTextActive(editor, textColor);

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

  const handleColorText = useCallback(() => {
    if (!editor || !canColorTextState) return false;

    if (editor.state.storedMarks) {
      const textStyleMarkType = editor.schema.marks.textStyle;
      if (textStyleMarkType) {
        editor.view.dispatch(editor.state.tr.removeStoredMark(textStyleMarkType));
      }
    }

    setTimeout(() => {
      const success = editor.chain().focus().toggleMark("textStyle", { color: textColor }).run();
      if (success) {
        onApplied?.({ color: textColor, label });
      }
      return success;
    }, 500);
  }, [editor, canColorTextState, textColor, onApplied, label]);

  return {
    isVisible,
    isActive,
    handleColorText,
    canColorText: canColorTextState,
    label: label || `Color text to ${textColor}`,
  };
}
