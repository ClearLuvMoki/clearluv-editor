import type { Editor } from "@tiptap/core";
import { TaskList } from "@tiptap/extension-task-list";
import { List, ListOrdered, ListTodo } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { canToggleList, isListActive, isNodeInSchema, toggleList } from "@/lib/utils";

export { BulletList } from "@tiptap/extension-bullet-list";

export type ListType = "bulletList" | "orderedList" | "taskList";

export interface UseListConfig {
  editor?: Editor | null;
  type: ListType;
  hideWhenUnavailable?: boolean;
  onToggled?: () => void;
}

export function shouldShowButton(props: {
  editor: Editor | null;
  type: ListType;
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, type, hideWhenUnavailable } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isNodeInSchema(type, editor)) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canToggleList(editor, type);
  }

  return true;
}

export function useList(config: UseListConfig) {
  const { editor: providedEditor, type, hideWhenUnavailable = false, onToggled } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const canToggle = canToggleList(editor, type);
  const isActive = isListActive(editor, type);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, type, hideWhenUnavailable }));
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, type, hideWhenUnavailable]);

  const handleToggle = useCallback(() => {
    if (!editor) return false;

    const success = toggleList(editor, type);
    if (success) {
      onToggled?.();
    }
    return success;
  }, [editor, type, onToggled]);

  const icon = useMemo(() => {
    switch (config?.type) {
      case "bulletList":
        return List;
      case "taskList":
        return ListTodo;
      case "orderedList":
        return ListOrdered;
    }
  }, [config?.type]);

  const label = useMemo(() => {
    switch (config?.type) {
      case "bulletList":
        return "Bullet List";
      case "taskList":
        return "To-do list";
      case "orderedList":
        return "Numbered List";
    }
  }, [config?.type]);

  return {
    isVisible,
    isActive,
    handleToggle,
    canToggle,
    label,
    icon,
  };
}
