import {
  Bold,
  Color,
  Document,
  FontFamily,
  HardBreak,
  Highlight,
  Italic,
  Paragraph,
  Placeholder,
  Strike,
  Subscript,
  Superscript,
  Text,
  TextStyle,
  Underline,
} from "@/extensions";

export const Extensions: any[] = [
  Document,
  Paragraph,
  Text,
  TextStyle,
  Placeholder.configure({
    showOnlyCurrent: true,
    placeholder: ({ node }) => {
      if (["codeBlock", "taskList"].includes(node.type.name)) {
        return "";
      }
      return "Write some for self...";
    },
  }),
  Italic,
  Bold,
  Underline,
  Strike,
  Subscript,
  Superscript,
  Highlight.configure({ multicolor: true }),
  Color,
  FontFamily,
  HardBreak,
];
