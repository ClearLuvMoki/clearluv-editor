import { type ComponentProps, type MouseEvent, useCallback } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { type UseDeleteNodeConfig, useDeleteNode } from "@/hooks/use-delete";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

export interface Props extends Omit<ComponentProps<"button">, "type">, UseDeleteNodeConfig {
  text?: string;
  showShortcut?: boolean;
}

export const DropdownDelete = ({
  editor: providedEditor,
  text,
  hideWhenUnavailable = false,
  onDeleted,
}: Props) => {
  const { editor } = useTiptapEditor(providedEditor);
  const { isVisible, handleDeleteNode, Icon } = useDeleteNode({
    editor,
    hideWhenUnavailable,
    onDeleted,
  });

  const handleClick = useCallback(
    (event: MouseEvent<any>) => {
      if (event.defaultPrevented) return;
      handleDeleteNode();
    },
    [handleDeleteNode],
  );

  if (!isVisible) {
    return null;
  }

  return (
    <DropdownMenuItem onClick={handleClick}>
      <Icon />
      {text && <span>{text}</span>}
    </DropdownMenuItem>
  );
};
