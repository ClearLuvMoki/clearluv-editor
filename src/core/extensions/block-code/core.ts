import { type Editor, findParentNode } from "@tiptap/core";
import BuiltInCodeBlock from "@tiptap/extension-code-block";
import { TextSelection } from "@tiptap/pm/state";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { all, createLowlight } from "lowlight";
import { Braces } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { canToggleCodeBlock, isNodeInSchema, toggleCodeBlock } from "@/lib/utils";
import { LowlightPlugin } from "@/plugin/lowlight";
import { BlockCodeNode } from "./block-code-node";

const lowlight = createLowlight(all);

interface CodeBlockLowlightOptions {
  lowlight: any;
  defaultLanguage: string;
  maxHighlightLineNumber?: number;
}

export const BlockCode = BuiltInCodeBlock.extend<CodeBlockLowlightOptions>({
  name: "codeBlock",
  draggable: true,

  addOptions() {
    return {
      ...this.parent?.(),
      lowlight: {},
      defaultLanguage: "auto",
      maxHighlightLineNumber: 200,
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(BlockCodeNode);
  },

  addKeyboardShortcuts() {
    return {
      ...this?.parent?.(),
      "Mod-a": ({ editor }) => {
        const predicate = (node: any) => node.type === editor.view.state.schema.nodes.codeBlock;
        const node = findParentNode(predicate)(editor.state.selection);

        if (node) {
          const { pos, node: codeBlockNode } = node;

          if (typeof pos !== "number" || !codeBlockNode) {
            return false;
          }

          const startPos = pos + 1;
          const endPos = pos + codeBlockNode.nodeSize - 1;

          if (startPos >= 0 && endPos > startPos && endPos <= editor.state.doc.content.size) {
            try {
              const selection = TextSelection.create(editor.state.doc, startPos, endPos);
              editor.view.dispatch(editor.state.tr.setSelection(selection));
              return true;
            } catch (error) {
              console.error("Failed to create selection:", error);
              return false;
            }
          }
        }

        return false;
      },
      Enter: ({ editor }) => {
        const predicate = (node: any) => node.type === editor.view.state.schema.nodes.codeBlock;
        const node = findParentNode(predicate)(editor.state.selection);
        console.log(editor.view.state.schema.nodes);
        if (!node) return false;

        const { $from } = editor.state.selection;

        const isAtEnd = $from.parentOffset === $from.parent.nodeSize - 2;
        const endsWithDoubleNewline = $from.parent.textContent.endsWith("\n\n");

        if (isAtEnd && endsWithDoubleNewline) {
          return editor
            .chain()
            .command(({ tr }) => {
              tr.delete($from.pos - 2, $from.pos);

              return true;
            })
            .exitCode()
            .run();
        }

        return editor.commands.newlineInCode();
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      ...(this.parent?.() || []),
      LowlightPlugin({
        name: this.name,
        lowlight: this.options.lowlight,
        defaultLanguage: this.options.defaultLanguage,
        maxHighlightLineNumber: this.options.maxHighlightLineNumber || 200,
      }),
    ];
  },
}).configure({
  lowlight,
  defaultLanguage: "auto",
});

export interface UseCodeBlockConfig {
  editor?: Editor | null;
  hideWhenUnavailable?: boolean;
  onToggled?: () => void;
}

export function shouldShowButton(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, hideWhenUnavailable } = props;

  if (!editor || !editor.isEditable) return false;
  if (!isNodeInSchema("codeBlock", editor)) return false;

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canToggleCodeBlock(editor);
  }

  return true;
}

export function useCodeBlock(config?: UseCodeBlockConfig) {
  const { editor: providedEditor, hideWhenUnavailable = false, onToggled } = config || {};

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const canToggleState = canToggleCodeBlock(editor);
  const isActive = editor?.isActive("codeBlock") || false;

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, hideWhenUnavailable }));
    };

    handleSelectionUpdate();

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  const handleToggle = useCallback(() => {
    if (!editor) return false;

    const success = toggleCodeBlock(editor);
    if (success) {
      onToggled?.();
    }
    return success;
  }, [editor, onToggled]);

  return {
    isVisible,
    isActive,
    handleToggle,
    canToggle: canToggleState,
    label: "Code Block",
    icon: Braces,
  };
}
