import { type ComponentProps, useCallback } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { type UseDuplicateConfig, useDuplicate } from "@/hooks/use-duplicate";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

export interface DuplicateButtonProps
  extends Omit<ComponentProps<"button">, "type">,
    UseDuplicateConfig {
  text?: string;
  showShortcut?: boolean;
}

export const DropdownDuplicate = ({
  editor: providedEditor,
  text,
  hideWhenUnavailable = false,
  onDuplicated,
  onClick,
}: DuplicateButtonProps) => {
  const { editor } = useTiptapEditor(providedEditor);
  const { isVisible, handleDuplicate, Icon } = useDuplicate({
    editor,
    hideWhenUnavailable,
    onDuplicated,
  });

  const handleClick = useCallback(
    (event: any) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      handleDuplicate();
    },
    [handleDuplicate, onClick],
  );

  if (!isVisible) {
    return null;
  }

  return (
    <DropdownMenuItem onClick={handleClick}>
      <Icon className="tiptap-button-icon" />
      {text && <span className="tiptap-button-text">{text}</span>}
    </DropdownMenuItem>
  );
};
