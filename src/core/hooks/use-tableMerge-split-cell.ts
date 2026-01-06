"use client";

import { mergeCells, splitCell } from "prosemirror-tables";
import type { Editor } from "@tiptap/react";
import { BetweenHorizontalEnd, SquareSplitHorizontal } from "lucide-react";
import { useCallback } from "react";
// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { isExtensionAvailable } from "@/lib/utils";

export type MergeSplitAction = "merge" | "split";

export interface UseTableMergeSplitCellConfig {
  editor?: Editor | null;
  action: MergeSplitAction;
  hideWhenUnavailable?: boolean;
  onExecuted?: (action: MergeSplitAction) => void;
}

const REQUIRED_EXTENSIONS = ["table"];

export const tableMergeSplitCellLabels: Record<MergeSplitAction, string> = {
  merge: "Merge cells",
  split: "Split cell",
};

export const tableMergeSplitCellIcons = {
  merge: BetweenHorizontalEnd,
  split: SquareSplitHorizontal,
};

/**
 * Checks if a table cell merge can be performed
 * in the current editor state.
 */
function canMergeCells(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable || !isExtensionAvailable(editor, REQUIRED_EXTENSIONS)) {
    return false;
  }

  try {
    return mergeCells(editor.state as any, undefined);
  } catch {
    return false;
  }
}

/**
 * Checks if a table cell split can be performed
 * in the current editor state.
 */
function canSplitCell(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable || !isExtensionAvailable(editor, REQUIRED_EXTENSIONS)) {
    return false;
  }

  try {
    return splitCell(editor.state as any, undefined);
  } catch {
    return false;
  }
}

/**
 * Executes the cell merge operation in the editor.
 */
function tableMergeCells(editor: Editor | null): boolean {
  if (!canMergeCells(editor) || !editor) return false;

  try {
    const { state, view } = editor;
    return mergeCells(state as any, view.dispatch.bind(view) as any);
  } catch (error) {
    console.error("Error merging table cells:", error);
    return false;
  }
}

/**
 * Executes the cell split operation in the editor.
 */
function tableSplitCell(editor: Editor | null): boolean {
  if (!canSplitCell(editor) || !editor) return false;

  try {
    const { state, view } = editor;
    return splitCell(state as any, view.dispatch.bind(view) as any);
  } catch (error) {
    console.error("Error splitting table cell:", error);
    return false;
  }
}

/**
 * Executes the merge/split operation in the editor.
 */
function tableMergeSplitCell({
  editor,
  action,
}: {
  editor: Editor | null;
  action: MergeSplitAction;
}): boolean {
  if (!editor) return false;

  try {
    return action === "merge" ? tableMergeCells(editor) : tableSplitCell(editor);
  } catch (error) {
    console.error(`Error ${action}ing table cell:`, error);
    return false;
  }
}

/**
 * Determines if the merge/split button should be shown
 * based on editor state and config.
 */
function shouldShowButton({
  editor,
  action,
  hideWhenUnavailable,
}: {
  editor: Editor | null;
  action: MergeSplitAction;
  hideWhenUnavailable: boolean;
}): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isExtensionAvailable(editor, REQUIRED_EXTENSIONS)) return false;

  if (hideWhenUnavailable) {
    return action === "merge" ? canMergeCells(editor) : canSplitCell(editor);
  }

  return true;
}

export function useTableMergeSplitCell(config: UseTableMergeSplitCellConfig) {
  const { editor: providedEditor, action, hideWhenUnavailable = false, onExecuted } = config;

  const { editor } = useTiptapEditor(providedEditor);

  const isVisible = shouldShowButton({
    editor,
    action,
    hideWhenUnavailable,
  });

  const canPerformAction = action === "merge" ? canMergeCells(editor) : canSplitCell(editor);

  const handleExecute = useCallback(() => {
    const success = tableMergeSplitCell({
      editor,
      action,
    });

    if (success) {
      onExecuted?.(action);
    }
    return success;
  }, [editor, action, onExecuted]);

  return {
    isVisible,
    canExecute: canPerformAction,
    handleExecute,
    label: tableMergeSplitCellLabels[action],
    Icon: tableMergeSplitCellIcons[action],
  };
}
