import { ImageNodeFloating } from "@/components/floating/image-node";
import { FloatingElement } from "@/components/floating-element";
import { Toolbar, ToolbarGroup } from "@/components/toolbar";
import { useFloatingToolbarVisibility } from "@/hooks/use-floating-toolbar-visibility";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import useUiEditorState from "@/hooks/use-ui-editor-state";
import { isSelectionValid } from "@/lib/utils";

export function NotionToolbarFloating() {
  const { editor } = useTiptapEditor();
  const { lockDragHandle, commentInputVisible } = useUiEditorState(editor);

  const { shouldShow } = useFloatingToolbarVisibility({
    editor,
    isSelectionValid,
    extraHideWhen: Boolean(commentInputVisible),
  });

  if (lockDragHandle) return null;

  return (
    <FloatingElement shouldShow={shouldShow}>
      <Toolbar variant="floating">
        <ToolbarGroup>
          <ImageNodeFloating />
        </ToolbarGroup>
      </Toolbar>
    </FloatingElement>
  );
}
