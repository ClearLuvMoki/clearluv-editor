import * as React from "react";
import { Button } from "@/components/ui/button";
import { type UseImageCaptionConfig, useImageCaption } from "@/extensions/image/use-image-caption";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

export interface ImageCaptionButtonProps extends Omit<any, "type">, UseImageCaptionConfig {
  text?: string;
}

export const ImageCaptionButton = React.forwardRef<HTMLButtonElement, ImageCaptionButtonProps>(
  (
    {
      editor: providedEditor,
      text,
      hideWhenUnavailable = false,
      onSet,
      onClick,
      children,
      ...buttonProps
    },
    ref,
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const { isVisible, isActive, canToggle, handleToggleCaption, label, Icon } = useImageCaption({
      editor,
      hideWhenUnavailable,
      onSet,
    });

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        handleToggleCaption();
      },
      [handleToggleCaption, onClick],
    );

    if (!isVisible) {
      return null;
    }

    return (
      <Button
        variant="ghost"
        data-active-state={isActive ? "on" : "off"}
        tabIndex={-1}
        disabled={!canToggle}
        data-disabled={!canToggle}
        aria-label={label}
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
