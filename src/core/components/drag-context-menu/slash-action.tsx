import { Plus } from "lucide-react";
import { type MouseEvent, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  type UseSlashCommandTriggerConfig,
  useSlashCommandTrigger,
} from "@/hooks/use-slash-command-trigger";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

export interface SlashCommandTriggerButtonProps
  extends Omit<any, "type">,
    UseSlashCommandTriggerConfig {}

export function SlashAction({
  editor: providedEditor,
  node,
  nodePos,
  trigger = "/",
  hideWhenUnavailable = false,
  onTriggered,
}: SlashCommandTriggerButtonProps) {
  const { editor } = useTiptapEditor(providedEditor);

  const { isVisible, handleSlashCommand } = useSlashCommandTrigger({
    editor,
    node,
    nodePos,
    trigger,
    hideWhenUnavailable,
    onTriggered,
  });

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement, MouseEvent>) => {
      if (event.defaultPrevented) return;
      handleSlashCommand();
    },
    [handleSlashCommand],
  );

  if (!isVisible) {
    return null;
  }

  return (
    //   @ts-ignore
    <Button variant={"ghost"} size="icon-sm" onClick={handleClick} style={{ width: 20 }}>
      <Plus />
    </Button>
  );
}
