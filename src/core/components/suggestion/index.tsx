import { flip, offset, shift, size } from "@floating-ui/react";
import type { Editor } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import Suggestion, {
  type SuggestionKeyDownProps,
  type SuggestionOptions,
  SuggestionPluginKey,
  type SuggestionProps,
} from "@tiptap/suggestion";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { calculateStartPosition } from "@/components/suggestion/utils";
import { useFloatingElement } from "@/hooks/use-floating-element";
import { useMenuNavigation } from "@/hooks/use-menu-navigation";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { cn } from "@/lib/utils";
import type { SuggestionItemProps } from "./types";

interface Props<T> extends Omit<SuggestionOptions<SuggestionItemProps<T>>, "pluginKey" | "editor"> {
  char: string;
  editor?: Editor | null;
  maxHeight?: number;
  selector?: string;
  pluginKey?: string | PluginKey;
  children: (props: any) => ReactNode;
}

export function SuggestionMenu({
  editor: providedEditor,
  maxHeight = 384,
  selector = "moki-editor-suggestion-menu",
  pluginKey = SuggestionPluginKey,
  children,
  ...internalSuggestionProps
}: Props<any>) {
  const { editor } = useTiptapEditor(providedEditor);

  const [show, setShow] = useState<boolean>(false);
  const [internalClientRect, setInternalClientRect] = useState<DOMRect | null>(null);
  const [internalItems, setInternalItems] = useState<SuggestionItemProps[]>([]);
  const [internalCommand, setInternalCommand] = useState<
    ((item: SuggestionItemProps) => void) | null
  >(null);
  const [, setInternalRange] = useState<Range | null>(null);
  const [internalQuery, setInternalQuery] = useState<string>("");
  const internalSuggestionPropsRef = useRef(internalSuggestionProps);

  useEffect(() => {
    internalSuggestionPropsRef.current = internalSuggestionProps;
    // biome-ignore lint/correctness/useExhaustiveDependencies: <ignore props>
  }, [internalSuggestionProps]);

  const { ref, style, getFloatingProps, isMounted } = useFloatingElement(
    show,
    internalClientRect,
    1000,
    {
      placement: "bottom-start",
      middleware: [
        offset(10),
        flip({
          mainAxis: true,
          crossAxis: false,
        }),
        shift(),
        size({
          apply({ availableHeight, elements }) {
            if (elements.floating) {
              const maxHeightValue = maxHeight
                ? Math.min(maxHeight, availableHeight)
                : availableHeight;

              console.log(maxHeightValue, "maxHeightValue");
              elements.floating.style.setProperty(
                "--suggestion-menu-max-height",
                `${maxHeightValue}px`,
              );
            }
          },
        }),
      ],
      onOpenChange(open) {
        if (!open) {
          setShow(false);
        }
      },
    },
  );

  const closePopup = useCallback(() => {
    setShow(false);
  }, []);

  const onSelect = useCallback(
    (item: SuggestionItemProps) => {
      closePopup();

      if (internalCommand) {
        internalCommand(item);
      }
    },
    [closePopup, internalCommand],
  );

  const { selectedIndex } = useMenuNavigation({
    editor: editor,
    query: internalQuery,
    items: internalItems,
    onSelect,
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      return;
    }
    const existingPlugin = editor.state.plugins.find((plugin) => plugin.spec.key === pluginKey);
    if (existingPlugin) {
      editor.unregisterPlugin(pluginKey);
    }
    const suggestion = Suggestion({
      pluginKey: pluginKey instanceof PluginKey ? pluginKey : new PluginKey(pluginKey),
      editor,

      command({ editor, range, props }) {
        if (!range) {
          return;
        }

        const { view, state } = editor;
        const { selection } = state;

        const isMention = editor.extensionManager.extensions.some((extension) => {
          const name = extension.name;
          return (
            name === "mention" &&
            extension.options?.suggestion?.char === internalSuggestionPropsRef.current.char
          );
        });

        if (!isMention) {
          const cursorPosition = selection.$from.pos;
          const previousNode = selection.$head?.nodeBefore;

          const startPosition = previousNode
            ? calculateStartPosition(
                cursorPosition,
                previousNode,
                internalSuggestionPropsRef.current.char,
              )
            : selection.$from.start();

          const transaction = state.tr.deleteRange(startPosition, cursorPosition);
          view.dispatch(transaction);
        }

        const nodeAfter = view.state.selection.$to.nodeAfter;
        const overrideSpace = nodeAfter?.text?.startsWith(" ");

        const rangeToUse = { ...range };

        if (overrideSpace) {
          rangeToUse.to += 1;
        }

        props.onSelect({ editor, range: rangeToUse, context: props.context });
      },
      render: () => {
        return {
          onStart: (props: SuggestionProps<SuggestionItemProps>) => {
            setInternalCommand(() => props.command);
            setInternalItems(props.items);
            setInternalQuery(props.query);
            setInternalRange(props.range as any);
            setInternalClientRect(props.clientRect?.() ?? null);
            setShow(true);
          },

          onUpdate: (props: SuggestionProps<SuggestionItemProps>) => {
            setInternalCommand(() => props.command);
            setInternalItems(props.items);
            setInternalQuery(props.query);
            setInternalRange(props.range as any);
            setInternalClientRect(props.clientRect?.() ?? null);
          },

          onKeyDown: (props: SuggestionKeyDownProps) => {
            if (props.event.key === "Escape") {
              closePopup();
              return true;
            }
            return false;
          },

          onExit: () => {
            setInternalCommand(null);
            setInternalItems([]);
            setInternalQuery("");
            setInternalRange(null);
            setInternalClientRect(null);
            setShow(false);
          },
        };
      },
      decorationClass: cn(
        "editor-slash-decoration rounded-xs",
        internalSuggestionPropsRef.current?.decorationClass,
      ),
      ...internalSuggestionPropsRef.current,
    });
    editor.registerPlugin(suggestion);

    return () => {
      if (!editor.isDestroyed) {
        editor.unregisterPlugin(pluginKey);
      }
    };
  }, [editor, pluginKey, closePopup]);

  if (!isMounted || !show || !editor) {
    return null;
  }

  return (
    <div
      ref={ref}
      style={style}
      {...getFloatingProps()}
      data-selector={selector}
      className={selector}
      onPointerDown={(e) => e.preventDefault()}
    >
      {children({
        items: internalItems,
        selectedIndex,
        onSelect,
      })}
    </div>
  );
}
