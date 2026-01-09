import { forwardRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { type UseImageAlignConfig, useImageAlign } from "@/extensions/image/use-image-align";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
export interface ImageAlignButtonProps extends Omit<any, "type">, UseImageAlignConfig {
  text?: string;
  showShortcut?: boolean;
}

export const ImageAlignButton = forwardRef<HTMLButtonElement, ImageAlignButtonProps>(
  (
    {
      editor: providedEditor,
      align,
      text,
      extensionName,
      attributeName = "data-align",
      hideWhenUnavailable = false,
      onAligned,
      showShortcut = false,
      onClick,
      children,
      ...buttonProps
    },
    ref,
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const { isVisible, handleImageAlign, label, canAlign, isActive, Icon } = useImageAlign({
      editor,
      align,
      extensionName,
      attributeName,
      hideWhenUnavailable,
      onAligned,
    });

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        handleImageAlign();
      },
      [handleImageAlign, onClick],
    );

    if (!isVisible) {
      return null;
    }

    return (
      <Button
        variant={"ghost"}
        disabled={!canAlign}
        data-active-state={isActive ? "on" : "off"}
        data-disabled={!canAlign}
        tabIndex={-1}
        aria-label={label}
        aria-pressed={isActive}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <Icon className="tiptap-button-icon" />
            {text && <span className="tiptap-button-text">{text}</span>}
          </>
        )}
      </Button>
    );
  },
);
