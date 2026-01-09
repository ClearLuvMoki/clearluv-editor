import { NodeSelection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import { AlignCenterVertical, AlignEndVertical, AlignStartVertical } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { isExtensionAvailable } from "@/lib/utils";
export type ImageAlign = "left" | "center" | "right";

export interface UseImageAlignConfig {
  editor?: Editor | null;
  align: ImageAlign;
  extensionName?: string;
  attributeName?: string;
  hideWhenUnavailable?: boolean;
  onAligned?: () => void;
}

export const imageAlignIcons = {
  left: AlignStartVertical,
  center: AlignCenterVertical,
  right: AlignEndVertical,
};

export const imageAlignLabels: Record<ImageAlign, string> = {
  left: "Image align left",
  center: "Image align center",
  right: "Image align right",
};

/**
 * Checks if image alignment can be performed in the current editor state
 */
export function canSetImageAlign(
  editor: Editor | null,
  align: ImageAlign,
  extensionName: string = "image",
  attributeName: string = "data-align",
): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isExtensionAvailable(editor, [extensionName])) return false;

  return editor.can().updateAttributes(extensionName, { [attributeName]: align });
}

/**
 * Checks if the image alignment is currently active
 */
export function isImageAlignActive(
  editor: Editor | null,
  align: ImageAlign,
  extensionName: string = "image",
  attributeName: string = "data-align",
): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isExtensionAvailable(editor, [extensionName])) return false;

  const attributes = editor.getAttributes(extensionName);
  const currentAlign = attributes[attributeName] || "left";
  return currentAlign === align;
}

/**
 * Sets image alignment in the editor
 */
export function setImageAlign(
  editor: Editor | null,
  align: ImageAlign,
  extensionName: string = "image",
  attributeName: string = "data-align",
): boolean {
  if (!editor?.isEditable) {
    return false;
  }

  if (!isExtensionAvailable(editor, [extensionName])) {
    return false;
  }

  if (!canSetImageAlign(editor, align, extensionName, attributeName)) {
    return false;
  }

  try {
    const { selection } = editor.state;
    const isNodeSelection = selection instanceof NodeSelection;
    const selectionPosition = isNodeSelection ? selection.from : selection.$anchor.pos;

    const alignmentUpdated = editor
      .chain()
      .focus()
      .updateAttributes(extensionName, { [attributeName]: align })
      .run();

    // Restore node selection if it was originally selected
    // This is the temporary solution as image-node-extension.ts contain content: "inline*"
    if (alignmentUpdated && isNodeSelection) {
      editor.commands.setNodeSelection(selectionPosition);
    }

    return alignmentUpdated;
  } catch {
    return false;
  }
}

/**
 * Determines if the image align button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
  align: ImageAlign;
  extensionName?: string;
  attributeName?: string;
}): boolean {
  const {
    editor,
    hideWhenUnavailable,
    align,
    extensionName = "image",
    attributeName = "data-align",
  } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isExtensionAvailable(editor, [extensionName])) return false;

  if (hideWhenUnavailable) {
    return canSetImageAlign(editor, align, extensionName, attributeName);
  }

  return true;
}

export function useImageAlign(config: UseImageAlignConfig) {
  const {
    editor: providedEditor,
    align,
    extensionName = "image",
    attributeName = "data-align",
    hideWhenUnavailable = false,
    onAligned,
  } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const canAlign = canSetImageAlign(editor, align, extensionName, attributeName);
  const isActive = isImageAlignActive(editor, align, extensionName, attributeName);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(
        shouldShowButton({
          editor,
          align,
          hideWhenUnavailable,
          extensionName,
          attributeName,
        }),
      );
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);
    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable, align, extensionName, attributeName]);

  const handleImageAlign = useCallback(() => {
    if (!editor) return false;

    const success = setImageAlign(editor, align, extensionName, attributeName);
    if (success) {
      onAligned?.();
    }
    return success;
  }, [editor, align, extensionName, attributeName, onAligned]);

  return {
    isVisible,
    isActive,
    handleImageAlign,
    canAlign,
    label: imageAlignLabels[align],
    Icon: imageAlignIcons[align],
  };
}
