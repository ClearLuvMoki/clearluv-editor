import type { Editor } from "@tiptap/react";
import { useHover } from "ahooks";
import { Dot, Grip, GripHorizontal, GripIcon } from "lucide-react";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { ColorAction } from "@/components/drag-context-menu/color-action";
import { TableAlignMenu } from "@/components/table-cell-handle-menu/table-align-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTableClearRowColumnContent } from "@/hooks/use-table-clear-row-column-content";
import { useTableMergeSplitCell } from "@/hooks/use-tableMerge-split-cell";
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { cn } from "@/lib/utils";

interface TableAction {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  onClick: () => void;
  isAvailable: boolean;
  isActive?: boolean;
  shortcutBadge?: React.ReactNode;
}

/**
 * Hook to manage all table actions and their availability
 */
function useTableActions() {
  const mergeCellAction = useTableMergeSplitCell({ action: "merge" });
  const splitCellAction = useTableMergeSplitCell({ action: "split" });
  const clearContentAction = useTableClearRowColumnContent({ resetAttrs: true });

  const mergeAction: TableAction = {
    icon: mergeCellAction.Icon,
    label: mergeCellAction.label,
    onClick: mergeCellAction.handleExecute,
    isAvailable: mergeCellAction.canExecute,
  };

  const splitAction: TableAction = {
    icon: splitCellAction.Icon,
    label: splitCellAction.label,
    onClick: splitCellAction.handleExecute,
    isAvailable: splitCellAction.canExecute,
  };

  const clearAction: TableAction = {
    icon: clearContentAction.Icon,
    label: clearContentAction.label,
    onClick: clearContentAction.handleClear,
    isAvailable: clearContentAction.canClearRowColumnContent,
  };

  return {
    mergeAction,
    splitAction,
    clearAction,
  };
}

/**
 * Hook to manage table handle menu state and interactions
 */
function useTableCellHandleMenu({ editor }: { editor: Editor | null }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    editor?.commands.unfreezeHandles();
  }, [editor]);

  const handleMenuToggle = useCallback(
    (isOpen: boolean) => {
      setIsMenuOpen(isOpen);

      if (!editor) return;

      if (isOpen) {
        editor.commands.freezeHandles();
      } else {
        editor.commands.unfreezeHandles();
      }
    },
    [editor],
  );

  return {
    isMenuOpen,
    handleMenuToggle,
    closeMenu,
  };
}

const TableActionItem = ({ action }: { action: TableAction }) => {
  const { icon: Icon, label, onClick, isActive = false, shortcutBadge } = action;

  return (
    <DropdownMenuItem onClick={onClick}>
      <Icon className="tiptap-button-icon" />
      <span className="tiptap-button-text">{label}</span>
      {shortcutBadge}
    </DropdownMenuItem>
  );
};

const TableActionMenu = ({ onClose }: { onClose: () => void }) => {
  const { mergeAction, splitAction, clearAction } = useTableActions();

  return (
    <DropdownMenuContent>
      {mergeAction.isAvailable && <TableActionItem action={mergeAction} />}
      {splitAction.isAvailable && <TableActionItem action={splitAction} />}
      <ColorAction />
      <TableAlignMenu />
      {clearAction.isAvailable && <TableActionItem action={clearAction} />}
    </DropdownMenuContent>
  );
};

interface TableCellHandleMenuProps extends React.ComponentPropsWithoutRef<"button"> {
  editor?: Editor | null;
  onOpenChange?: (isOpen: boolean) => void;
}

export const TableCellHandleMenu = forwardRef<HTMLButtonElement, TableCellHandleMenuProps>(
  ({ editor: providedEditor, onOpenChange, className, ...props }) => {
    const { editor } = useTiptapEditor(providedEditor);
    const { isMenuOpen, handleMenuToggle, closeMenu } = useTableCellHandleMenu({
      editor,
    });
    const btnRef = useRef<HTMLDivElement | null>(null);
    const isHovered = useHover(btnRef);

    useEffect(() => {
      onOpenChange?.(isMenuOpen);
    }, [isMenuOpen, onOpenChange]);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            ref={btnRef}
            className={cn("table-expandable-menu-button", isMenuOpen && "menu-opened", className)}
          >
            {isHovered ? <GripHorizontal /> : <Dot />}
          </div>
        </DropdownMenuTrigger>
        <TableActionMenu onClose={closeMenu} />
      </DropdownMenu>
    );
  },
);

export { TableActionMenu };
