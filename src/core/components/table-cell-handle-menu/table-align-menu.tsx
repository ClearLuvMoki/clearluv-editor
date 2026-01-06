import { AlignHorizontalDistributeCenter } from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import type { Orientation } from "@/extensions/table-handle/utils";
import { useTableAlignCell } from "@/hooks/use-table-align-cell";

export interface ActionItemProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean;
  shortcutBadge?: React.ReactNode;
}

export const TableAlignMenu = ({
  index,
  orientation,
}: {
  index?: number;
  orientation?: Orientation;
}) => {
  const textAlign = {
    left: useTableAlignCell({
      alignmentType: "text",
      alignment: "left",
      index,
      orientation,
    }),
    center: useTableAlignCell({
      alignmentType: "text",
      alignment: "center",
      index,
      orientation,
    }),
    right: useTableAlignCell({
      alignmentType: "text",
      alignment: "right",
      index,
      orientation,
    }),
  };

  const verticalAlign = {
    top: useTableAlignCell({
      alignmentType: "vertical",
      alignment: "top",
      index,
      orientation,
    }),
    middle: useTableAlignCell({
      alignmentType: "vertical",
      alignment: "middle",
      index,
      orientation,
    }),
    bottom: useTableAlignCell({
      alignmentType: "vertical",
      alignment: "bottom",
      index,
      orientation,
    }),
  };

  if (!textAlign.left.canAlignCell()) {
    return null;
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <AlignHorizontalDistributeCenter />
        <span>Alignment</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {Object.values(textAlign).map((align, i) => {
            const Icon = align.Icon;
            return (
              <DropdownMenuItem key={`text-${String(i)}`} onClick={align.handleAlign}>
                <Icon />
                <span>{align.label}</span>
              </DropdownMenuItem>
            );
          })}
          <Separator orientation="horizontal" />
          {Object.values(verticalAlign).map((align, i) => {
            const Icon = align.Icon;
            return (
              <DropdownMenuItem key={`text-${String(i)}`} onClick={align.handleAlign}>
                <Icon />
                <span>{align.label}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
};
