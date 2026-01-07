import { LayoutTemplate } from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useNodeTransformActions } from "@/hooks/use-node-transform-actions";

export function DropdownTurnInto() {
  const actions = useNodeTransformActions();
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <LayoutTemplate />
        <span>Turn Into</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {actions.map((item) => {
            const Icon = item.icon;
            return (
              <DropdownMenuItem onClick={item.onClick} key={item?.label}>
                <Icon />
                {item.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
