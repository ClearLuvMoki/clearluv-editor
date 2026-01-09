import { NodeSelection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import { GalleryThumbnails } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { isExtensionAvailable, isNodeTypeSelected } from "@/lib/utils";

export interface UseImageCaptionConfig {
  editor?: Editor | null;
  hideWhenUnavailable?: boolean;
  onSet?: () => void;
}

export function canToggleImageCaption(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isExtensionAvailable(editor, ["image"])) return false;

  return isNodeTypeSelected(editor, ["image"]);
}

/**
 * Checks if the currently selected image has caption enabled
 */
export function isImageCaptionActive(editor: Editor | null): boolean {
  if (!editor) return false;

  try {
    const { selection } = editor.state;
    const isImageSelected =
      selection instanceof NodeSelection && selection.node.type.name === "image";

    if (!isImageSelected) {
      return false;
    }

    const imageNode = (selection as NodeSelection).node;
    return imageNode.attrs.showCaption === true || imageNode.content.size > 0;
  } catch {
    return false;
  }
}

/**
 * Toggles the image caption in the editor
 */
export function setImageCaption(editor: Editor | null): boolean {
  if (!editor?.isEditable || !canToggleImageCaption(editor)) {
    return false;
  }

  try {
    const { selection } = editor.state;
    const isImageSelected =
      selection instanceof NodeSelection && selection.node.type.name === "image";

    if (!isImageSelected) {
      return false;
    }

    const captionEnabled = editor
      .chain()
      .focus()
      .updateAttributes("image", { showCaption: true })
      .run();

    if (!captionEnabled) {
      return false;
    }

    const imagePosition = selection.from;
    editor
      .chain()
      .focus(imagePosition + 1)
      .selectTextblockEnd()
      .run();

    return true;
  } catch {
    return false;
  }
}

/**
 * Determines if the image caption button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, hideWhenUnavailable } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isExtensionAvailable(editor, ["image"])) return false;

  if (hideWhenUnavailable) {
    return canToggleImageCaption(editor);
  }

  return true;
}

export function useImageCaption(config?: UseImageCaptionConfig) {
  const { editor: providedEditor, hideWhenUnavailable = false, onSet } = config || {};

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isActive, setIsActive] = useState<boolean>(false);
  const canToggle = canToggleImageCaption(editor);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, hideWhenUnavailable }));
      setIsActive(isImageCaptionActive(editor));
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  const handleToggleCaption = useCallback(() => {
    if (!editor) return false;

    const success = setImageCaption(editor);
    if (success) {
      onSet?.();
    }
    return success;
  }, [editor, onSet]);

  return {
    isVisible,
    isActive,
    canToggle,
    handleToggleCaption,
    label: "Caption",
    Icon: GalleryThumbnails,
  };
}
