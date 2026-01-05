import { isNodeSelection } from "@tiptap/core";
import { NodeSelection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import { canResetMarks } from "@/lib/utils";

export const useMenuActionVisibility = (editor: Editor | null): any => {
  if (!editor) {
    return {
      hasAnyActionGroups: false,
      hasColorActions: false,
      hasTransformActions: false,
      hasResetFormatting: false,
      hasImage: false,
    };
  }

  const { selection } = editor.state;
  let node = selection.$anchor.node(1);

  if (selection instanceof NodeSelection) {
    node = selection.node;
  }

  const hasColorActions: boolean =
    !!editor.can().setMark("textStyle") || !!editor.can().setMark("highlight") || false;

  const hasTransformActions = !!(
    (node && node.type && node.type.name)
    // &&
    // TURN_INTO_BLOCKS.includes(node.type.name)
  );

  const hasImage = isNodeSelection(selection) && node.type.name === "image";

  const hasResetFormatting = canResetMarks(editor.state.tr, ["inlineThread"]);

  const hasAnyActionGroups = hasColorActions || hasTransformActions || hasResetFormatting;

  return {
    hasAnyActionGroups,
    hasColorActions,
    hasTransformActions,
    hasResetFormatting,
    hasImage,
  };
};
