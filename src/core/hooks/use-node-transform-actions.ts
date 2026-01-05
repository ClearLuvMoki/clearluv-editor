import { useBlockquote } from "@/extensions/block-quote";
import { useList } from "@/extensions/bullet-list";
import { useCodeBlock } from "@/extensions/code-block";
import { useHeading } from "@/extensions/heading";
import { useText } from "@/extensions/text";

export const useNodeTransformActions = () => {
  const text = useText();
  const heading1 = useHeading({ level: 1 });
  const heading2 = useHeading({ level: 2 });
  const heading3 = useHeading({ level: 3 });
  const bulletList = useList({ type: "bulletList" });
  const orderedList = useList({ type: "orderedList" });
  const taskList = useList({ type: "taskList" });
  const blockquote = useBlockquote();
  const codeBlock = useCodeBlock();

  const mapper = (
    action: ReturnType<
      | typeof useText
      | typeof useHeading
      | typeof useList
      | typeof useBlockquote
      | typeof useCodeBlock
    >,
  ) => ({
    icon: action.icon,
    label: action.label,
    onClick: action.handleToggle,
    disabled: !action.canToggle,
    isActive: action.isActive,
  });

  return [
    mapper(text),
    ...[heading1, heading2, heading3].map(mapper),
    mapper(bulletList),
    mapper(orderedList),
    mapper(taskList),
    mapper(blockquote),
    mapper(codeBlock),
  ];
};
