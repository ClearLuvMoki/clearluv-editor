"use client";

import { flip, offset, shift, type UseFloatingOptions, useMergeRefs } from "@floating-ui/react";
import { Selection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFloatingElement } from "@/hooks/use-floating-element";
// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- Lib ---
import {
  getSelectionBoundingRect,
  isElementWithinEditor,
  isSelectionValid,
  isValidPosition,
} from "@/lib/utils";

export interface FloatingElementProps extends HTMLAttributes<HTMLDivElement> {
  editor?: Editor | null;
  shouldShow?: boolean;
  floatingOptions?: Partial<UseFloatingOptions>;
  zIndex?: number;
  onOpenChange?: (open: boolean) => void;
  referenceElement?: HTMLElement | null;
  getBoundingClientRect?: (editor: Editor) => DOMRect | null;
  closeOnEscape?: boolean;
}

export const FloatingElement = forwardRef<HTMLDivElement, FloatingElementProps>(
  (
    {
      editor: providedEditor,
      shouldShow = undefined,
      floatingOptions,
      zIndex = 50,
      onOpenChange,
      referenceElement,
      getBoundingClientRect = getSelectionBoundingRect,
      closeOnEscape = true,
      children,
      style: propStyle,
      ...props
    },
    forwardedRef,
  ) => {
    const [open, setOpen] = useState<boolean>(shouldShow !== undefined ? shouldShow : false);

    const floatingElementRef = useRef<HTMLDivElement | null>(null);
    const preventHideRef = useRef(false);
    const preventShowRef = useRef(false);
    const editorRef = useRef<Editor | null>(null);
    const getBoundingClientRectRef = useRef(getBoundingClientRect);

    const { editor } = useTiptapEditor(providedEditor);

    // Keep refs up to date
    useEffect(() => {
      editorRef.current = editor;
      getBoundingClientRectRef.current = getBoundingClientRect;
    }, [editor, getBoundingClientRect]);

    const handleOpenChange = useCallback(
      (newOpen: boolean) => {
        onOpenChange?.(newOpen);
        setOpen(newOpen);
      },
      [onOpenChange],
    );

    const handleFloatingOpenChange = (open: boolean) => {
      if (!open && editor) {
        const tr = editor.state.tr.setSelection(Selection.near(editor.state.doc.resolve(0)));
        editor.view.dispatch(tr);
      }

      handleOpenChange(open);
    };

    // Use referenceElement if provided, otherwise create dynamic rect function
    const reference = useMemo(() => {
      if (referenceElement) {
        return referenceElement;
      }

      return () => {
        if (!editorRef.current) return null;
        return getBoundingClientRectRef.current(editorRef.current);
      };
    }, [referenceElement]);

    const { isMounted, ref, style, getFloatingProps } = useFloatingElement(
      open,
      reference,
      zIndex,
      {
        placement: "top",
        middleware: [shift(), flip(), offset(4)],
        onOpenChange: handleFloatingOpenChange,
        dismissOptions: {
          enabled: true,
          escapeKey: true,
          outsidePress(event) {
            const relatedTarget = event.target as Node;
            if (!relatedTarget) return false;

            return !isElementWithinEditor(editor, relatedTarget);
          },
        },
        ...floatingOptions,
      },
    );

    const updateSelectionState = useCallback(() => {
      if (!editor) return;

      const newRect = getBoundingClientRect(editor);

      if (newRect && shouldShow !== undefined && !preventShowRef.current) {
        handleOpenChange(shouldShow);
        return;
      }

      const shouldShowResult = isSelectionValid(editor);

      if (newRect && !preventShowRef.current && (shouldShowResult || preventHideRef.current)) {
        handleOpenChange(true);
      } else if (
        !preventHideRef.current &&
        (!shouldShowResult || preventShowRef.current || !editor.isEditable)
      ) {
        handleOpenChange(false);
      }
    }, [editor, getBoundingClientRect, handleOpenChange, shouldShow]);

    useEffect(() => {
      if (!editor || !closeOnEscape) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape" && open) {
          handleOpenChange(false);
          return true;
        }
        return false;
      };

      editor.view.dom.addEventListener("keydown", handleKeyDown);
      return () => {
        editor.view.dom.removeEventListener("keydown", handleKeyDown);
      };
    }, [editor, open, closeOnEscape, handleOpenChange]);

    useEffect(() => {
      if (!editor) return;

      const handleBlur = (event: FocusEvent) => {
        if (preventHideRef.current) {
          preventHideRef.current = false;
          return;
        }

        const relatedTarget = event.relatedTarget as Node;
        if (!relatedTarget) return;

        const isWithinEditor = isElementWithinEditor(editor, relatedTarget);

        const floatingElement = floatingElementRef.current;
        const isWithinFloatingElement =
          floatingElement &&
          (floatingElement === relatedTarget || floatingElement.contains(relatedTarget));

        if (!isWithinEditor && !isWithinFloatingElement && open) {
          handleOpenChange(false);
        }
      };

      editor.view.dom.addEventListener("blur", handleBlur);
      return () => {
        editor.view.dom.removeEventListener("blur", handleBlur);
      };
    }, [editor, handleOpenChange, open]);

    useEffect(() => {
      if (!editor) return;

      const handleDrag = () => {
        if (open) {
          handleOpenChange(false);
        }
      };

      editor.view.dom.addEventListener("dragstart", handleDrag);
      editor.view.dom.addEventListener("dragover", handleDrag);

      return () => {
        editor.view.dom.removeEventListener("dragstart", handleDrag);
        editor.view.dom.removeEventListener("dragover", handleDrag);
      };
    }, [editor, open, handleOpenChange]);

    useEffect(() => {
      if (!editor) return;

      const handleMouseDown = (event: MouseEvent) => {
        if (event.button !== 0) return;

        preventShowRef.current = true;

        const { state, view } = editor;
        const posCoords = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });

        if (!posCoords || !isValidPosition(posCoords.pos)) return;

        const $pos = state.doc.resolve(posCoords.pos);
        const nodeBefore = $pos.nodeBefore;

        if (!nodeBefore || nodeBefore.isBlock) return;

        const tr = state.tr.setSelection(Selection.near(state.doc.resolve(posCoords.pos)));
        view.dispatch(tr);
      };

      const handleMouseUp = () => {
        if (preventShowRef.current) {
          preventShowRef.current = false;
          updateSelectionState();
        }
      };

      editor.view.dom.addEventListener("mousedown", handleMouseDown);
      editor.view.root.addEventListener("mouseup", handleMouseUp);

      return () => {
        editor.view.dom.removeEventListener("mousedown", handleMouseDown);
        editor.view.root.removeEventListener("mouseup", handleMouseUp);
      };
    }, [editor, updateSelectionState]);

    useEffect(() => {
      if (!editor) return;

      editor.on("selectionUpdate", updateSelectionState);

      return () => {
        editor.off("selectionUpdate", updateSelectionState);
      };
    }, [editor, updateSelectionState]);

    useEffect(() => {
      if (!editor) return;
      updateSelectionState();
    }, [editor, updateSelectionState]);

    const finalStyle = useMemo(
      () => (propStyle && Object.keys(propStyle).length > 0 ? propStyle : style),
      [propStyle, style],
    );
    const mergedRef = useMergeRefs([ref, forwardedRef, floatingElementRef]);

    if (!editor || !isMounted || !open) return null;

    return (
      <div ref={mergedRef} style={finalStyle} {...props} {...getFloatingProps()}>
        {children}
      </div>
    );
  },
);

FloatingElement.displayName = "FloatingElement";
