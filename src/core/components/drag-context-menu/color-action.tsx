import { isEqual } from "@react-hookz/deep-equal";
import { CaseSensitive, PaintBucket } from "lucide-react";
import { memo } from "react";
import { HIGHLIGHT_COLORS, TEXT_COLORS } from "@/components/color-menu/constants";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useColorHighlight } from "@/hooks/use-color-highlight";
import { useColorText } from "@/hooks/use-color-text";

const TextColor = memo(
  ({ label, value }: { label: string; value: string }) => {
    const { handleColorText } = useColorText({
      label: label,
      textColor: value,
    });
    return (
      <DropdownMenuItem onClick={handleColorText}>
        <CaseSensitive
          style={{
            color: value,
          }}
        />
        <span>{label}</span>
      </DropdownMenuItem>
    );
  },
  (prevProps, nextProps) => {
    return isEqual(prevProps, nextProps);
  },
);

const HighlightColor = memo(
  ({ label, value, border }: { label: string; value: string; border: string }) => {
    const { handleColorHighlight } = useColorHighlight({
      label: label,
      highlightColor: value,
    });
    return (
      <DropdownMenuItem onClick={handleColorHighlight}>
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: value, border: `1px solid ${border}` }}
        />
        <span>{label}</span>
      </DropdownMenuItem>
    );
  },
  (prevProps, nextProps) => {
    return isEqual(prevProps, nextProps);
  },
);

export function ColorAction() {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <PaintBucket />
        <span>Color</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuLabel className="text-xs text-gray-400">Text color</DropdownMenuLabel>
          {TEXT_COLORS.map((textColor) => (
            <TextColor key={textColor.value} label={textColor.label} value={textColor.value} />
          ))}
          <Separator orientation="horizontal" />
          <DropdownMenuLabel className="text-xs text-gray-400">Highlight color</DropdownMenuLabel>
          {HIGHLIGHT_COLORS.map((color) => (
            <HighlightColor
              key={color.value}
              label={color.label}
              value={color.value}
              border={color.border}
            />
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
