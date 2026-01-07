import type { Editor } from "@tiptap/core";
import { useCallback, useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { isMarkInSchema, isNodeTypeSelected } from "@/lib/utils";

export function isColorHighlightActive(editor: Editor | null, highlightColor?: string): boolean {
  if (!editor || !editor.isEditable) return false;
  return highlightColor
    ? editor.isActive("highlight", { color: highlightColor })
    : editor.isActive("highlight");
}

export function removeHighlight(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canColorHighlight(editor)) return false;

  return editor.chain().focus().unsetMark("highlight").run();
}

export function canColorText(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isMarkInSchema("textStyle", editor) || isNodeTypeSelected(editor, ["image"])) return false;

  try {
    return editor.can().setMark("textStyle", { color: "currentColor" });
  } catch {
    return false;
  }
}

export function canColorHighlight(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isMarkInSchema("highlight", editor) || isNodeTypeSelected(editor, ["image"])) return false;

  return editor.can().setMark("highlight");
}

export function isColorTextActive(editor: Editor | null, textColor: string): boolean {
  if (!editor || !editor.isEditable) return false;
  return editor.isActive("textStyle", { color: textColor });
}

export function shouldShowButton(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, hideWhenUnavailable } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isMarkInSchema("textStyle", editor)) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canColorText(editor);
  }

  return true;
}

export interface UseColorHighlightConfig {
  editor?: Editor | null;
  highlightColor?: string;
  label?: string;
  hideWhenUnavailable?: boolean;
  onApplied?: ({ color, label }: { color: string; label: string }) => void;
}
export function useColorHighlight(config: UseColorHighlightConfig) {
  const {
    editor: providedEditor,
    label,
    highlightColor,
    hideWhenUnavailable = false,
    onApplied,
  } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const canColorHighlightState = canColorHighlight(editor);
  const isActive = isColorHighlightActive(editor, highlightColor);

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

  const handleColorHighlight = useCallback(() => {
    if (!editor || !canColorHighlightState || !highlightColor || !label) return false;

    if (editor.state.storedMarks) {
      const highlightMarkType = editor.schema.marks.highlight;
      if (highlightMarkType) {
        editor.view.dispatch(editor.state.tr.removeStoredMark(highlightMarkType));
      }
    }

    setTimeout(() => {
      const success = editor
        .chain()
        .focus()
        .toggleMark("highlight", { color: highlightColor })
        .run();
      if (success) {
        onApplied?.({ color: highlightColor, label });
      }
      return success;
    }, 500);
  }, [canColorHighlightState, highlightColor, editor, label, onApplied]);

  const handleRemoveHighlight = useCallback(() => {
    const success = removeHighlight(editor);
    if (success) {
      onApplied?.({ color: "", label: "Remove highlight" });
    }
    return success;
  }, [editor, onApplied]);

  return {
    isVisible,
    isActive,
    handleColorHighlight,
    handleRemoveHighlight,
    canColorHighlight: canColorHighlightState,
    label: label || `Highlight`,
  };
}
