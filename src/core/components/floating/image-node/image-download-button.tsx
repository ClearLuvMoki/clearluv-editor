import { forwardRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  type UseImageDownloadConfig,
  useImageDownload,
} from "@/extensions/image/use-image-download";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

export interface ImageDownloadButtonProps extends Omit<any, "type">, UseImageDownloadConfig {
  text?: string;
  showShortcut?: boolean;
}

export const ImageDownloadButton = forwardRef<HTMLButtonElement, ImageDownloadButtonProps>(
  (
    {
      editor: providedEditor,
      text,
      hideWhenUnavailable = false,
      onDownloaded,
      resolveFileUrl,
      showShortcut = false,
      onClick,
      children,
      ...buttonProps
    },
    ref,
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const { isVisible, canDownload, handleDownload, label, Icon } = useImageDownload({
      editor,
      hideWhenUnavailable,
      onDownloaded,
      resolveFileUrl,
    });

    const handleClick = useCallback(
      async (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        await handleDownload();
      },
      [handleDownload, onClick],
    );

    if (!isVisible) {
      return null;
    }

    return (
      <Button
        variant="ghost"
        data-active-state="off"
        tabIndex={-1}
        disabled={!canDownload}
        data-disabled={!canDownload}
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
