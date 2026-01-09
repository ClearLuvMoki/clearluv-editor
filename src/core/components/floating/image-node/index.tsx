import "./index.css";
import type { Editor } from "@tiptap/react";
import { ImageAlignButton } from "@/components/floating/image-node/image-align-button";
import { ImageCaptionButton } from "@/components/floating/image-node/image-caption-button";
import { ImageDownloadButton } from "@/components/floating/image-node/image-download-button";
import { ImageUploadButton } from "@/components/floating/image-node/image-upload-button";
import { Separator } from "@/components/ui/separator";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { isNodeTypeSelected } from "@/lib/utils";

export function ImageNodeFloating({ editor: providedEditor }: { editor?: Editor | null }) {
  const { editor } = useTiptapEditor(providedEditor);
  const visible = isNodeTypeSelected(editor, ["image"]);

  if (!editor || !visible) {
    return null;
  }

  return (
    <div className={"flex flex-nowrap gap-1 items-center"}>
      <ImageAlignButton align="left" />
      <ImageAlignButton align="center" />
      <ImageAlignButton align="right" />
      <Separator orientation={"vertical"} className="!h-[20px] w-1" />
      <ImageCaptionButton />
      <Separator orientation={"vertical"} className="!h-[20px] w-1" />
      <ImageDownloadButton />
      <ImageUploadButton />
      {/*<ImageUploadButton icon={RefreshCcwIcon} tooltip="Replace" />*/}
      {/*<Separator />*/}
      {/*<DeleteNodeButton />*/}
    </div>
  );
}
