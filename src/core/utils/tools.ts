import type { Editor } from "@tiptap/core";
import { ToolsEnum } from "@/domains/enum/tools";

export class Tools {
  static onActions(editor: Editor, type?: ToolsEnum) {
    if (!editor || !type) return;
    switch (type) {
      case ToolsEnum.Undo: {
        return editor?.chain()?.focus()?.undo()?.run();
      }
      case ToolsEnum.Redo: {
        return editor?.chain()?.focus()?.redo()?.run();
      }
      case ToolsEnum.Bold: {
        return editor?.chain()?.focus()?.toggleBold()?.run();
      }
      case ToolsEnum.Italic: {
        return editor?.chain()?.focus()?.toggleItalic()?.run();
      }
      case ToolsEnum.Underline: {
        return editor?.chain()?.focus()?.toggleUnderline()?.run();
      }
      case ToolsEnum.Strike: {
        return editor?.chain()?.focus()?.toggleStrike()?.run();
      }
      case ToolsEnum.CodeBlock: {
        return editor?.chain().focus()?.setCodeBlock().run();
      }
      case ToolsEnum.OrderedList: {
        return editor?.chain()?.focus()?.toggleOrderedList()?.run();
      }
      case ToolsEnum.BulletList: {
        return editor?.chain()?.focus()?.toggleBulletList()?.run();
      }
      case ToolsEnum.Blockquote: {
        return editor?.chain()?.focus()?.setBlockquote()?.run();
      }
    }
  }
  static isNodeInSchema(nodeName: string, editor: Editor | null) {
    if (!editor?.schema) return false;
    return editor.schema.spec.nodes.get(nodeName) !== undefined;
  }

  static isExtensionAvailable(editor: Editor | null, extensionNames: string | string[]): boolean {
    if (!editor) return false;

    const names = Array.isArray(extensionNames) ? extensionNames : [extensionNames];

    const found = names.some((name) =>
      editor.extensionManager.extensions.some((ext) => ext.name === name),
    );

    if (!found) {
      console.warn(
        `None of the extensions [${names.join(", ")}] were found in the editor schema. Ensure they are included in the editor configuration.`,
      );
    }

    return found;
  }
}
