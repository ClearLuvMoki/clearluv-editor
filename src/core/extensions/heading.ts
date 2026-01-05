import type { Editor } from "@tiptap/core";
import type { Level } from "@tiptap/extension-heading";
import { Heading } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { canToggleHeading, isHeadingActive, isNodeInSchema, toggleHeading } from "@/lib/utils";

export { Heading } from "@tiptap/extension-heading";

export interface UseHeadingConfig {
  editor?: Editor | null;
  level: Level;
  hideWhenUnavailable?: boolean;
  onToggled?: () => void;
}

function shouldShowButton(props: {
  editor: Editor | null;
  level?: Level | Level[];
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, level, hideWhenUnavailable } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isNodeInSchema("heading", editor)) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    if (Array.isArray(level)) {
      return level.some((l) => canToggleHeading(editor, l));
    }
    return canToggleHeading(editor, level);
  }

  return true;
}

export function useHeading(config: UseHeadingConfig) {
  const { editor: providedEditor, level, hideWhenUnavailable = false, onToggled } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const canToggleState = canToggleHeading(editor, level);
  const isActive = isHeadingActive(editor, level);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, level, hideWhenUnavailable }));
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, level, hideWhenUnavailable]);

  const handleToggle = useCallback(() => {
    if (!editor) return false;

    const success = toggleHeading(editor, level);
    if (success) {
      onToggled?.();
    }
    return success;
  }, [editor, level, onToggled]);

  return {
    isVisible,
    isActive,
    handleToggle,
    canToggle: canToggleState,
    label: `Heading ${level}`,
    icon: Heading,
  };
}
