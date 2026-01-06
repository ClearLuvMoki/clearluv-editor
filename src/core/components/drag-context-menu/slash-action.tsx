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
    UseSlashCommandTriggerConfig {
  text?: string;
  showShortcut?: boolean;
}

export function SlashAction({
  editor: providedEditor,
  node,
  nodePos,
  text,
  trigger = "/",
  hideWhenUnavailable = false,
  onTriggered,
  showShortcut = false,
  children,
  ...buttonProps
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
      console.log(1212);
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
    <Button variant={"ghost"} size="icon-sm" onClick={handleClick}>
      <Plus />
    </Button>
  );
}
