import "./index.css";
import { Extension } from "@tiptap/core";
import type {
  TableCellOptions,
  TableHeaderOptions,
  TableOptions,
  TableRowOptions,
} from "@tiptap/extension-table";
import { TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
// @ts-ignore
import { Table } from "@tiptap/extension-table/table";
import type { Node } from "@tiptap/pm/model";
import { TextSelection } from "@tiptap/pm/state";
// @ts-ignore
import type { ViewMutationRecord } from "@tiptap/pm/view";
import { cellAround, columnResizing, TableView, tableEditing } from "prosemirror-tables";

const EMPTY_CELL_WIDTH = 120;
const RESIZE_MIN_WIDTH = 35;

export const TableNode = Table.extend<TableOptions>({
  addProseMirrorPlugins() {
    const isResizable = this.options.resizable && this.editor.isEditable;

    const defaultCellMinWidth =
      this.options.cellMinWidth < EMPTY_CELL_WIDTH ? EMPTY_CELL_WIDTH : this.options.cellMinWidth;

    return [
      ...(isResizable
        ? [
            columnResizing({
              handleWidth: this.options.handleWidth,
              cellMinWidth: RESIZE_MIN_WIDTH,
              defaultCellMinWidth,
              View: null,
              lastColumnResizable: this.options.lastColumnResizable,
            }),
          ]
        : []),
      tableEditing({
        allowTableNodeSelection: this.options.allowTableNodeSelection,
      }),
    ];
  },

  addNodeView() {
    return ({ node, HTMLAttributes }) => {
      class TiptapTableView extends TableView {
        private readonly blockContainer: HTMLDivElement;
        private readonly innerTableContainer: HTMLDivElement;
        private readonly widgetsContainer: HTMLDivElement;
        private readonly overlayContainer: HTMLDivElement;

        declare readonly node: Node;
        declare readonly minCellWidth: number;
        private readonly containerAttributes: Record<string, string>;

        constructor(node: Node, minCellWidth: number, containerAttributes: Record<string, string>) {
          super(node, minCellWidth);

          this.containerAttributes = containerAttributes ?? {};

          this.blockContainer = this.createBlockContainer();
          this.innerTableContainer = this.createInnerTableContainer();
          this.widgetsContainer = this.createWidgetsContainer();
          this.overlayContainer = this.createOverlayContainer();

          this.setupDOMStructure();
        }

        private createBlockContainer(): HTMLDivElement {
          const container = document.createElement("div");
          container.setAttribute("data-content-type", "table");

          this.applyContainerAttributes(container);
          return container;
        }

        private createInnerTableContainer(): HTMLDivElement {
          const container = document.createElement("div");
          container.className = "table-container";
          return container;
        }

        private createWidgetsContainer(): HTMLDivElement {
          const container = document.createElement("div");
          container.className = "table-controls";
          container.style.position = "relative";
          return container;
        }

        private createOverlayContainer(): HTMLDivElement {
          const container = document.createElement("div");
          container.className = "table-selection-overlay-container";
          return container;
        }

        private applyContainerAttributes(element: HTMLDivElement): void {
          Object.entries(this.containerAttributes).forEach(([key, value]) => {
            if (key !== "class") {
              element.setAttribute(key, value);
            }
          });
        }

        private setupDOMStructure(): void {
          const originalTable = this.dom;
          const tableElement = originalTable.firstChild!;

          this.innerTableContainer.appendChild(tableElement);

          originalTable.appendChild(this.innerTableContainer);
          originalTable.appendChild(this.widgetsContainer);
          originalTable.appendChild(this.overlayContainer);

          this.blockContainer.appendChild(originalTable);

          this.dom = this.blockContainer;
        }

        ignoreMutation(mutation: ViewMutationRecord): boolean {
          const target = mutation.target as HTMLElement;
          const isInsideTable = target.closest(".table-container");

          return !isInsideTable || super.ignoreMutation(mutation);
        }
      }

      const cellMinWidth =
        this.options.cellMinWidth < EMPTY_CELL_WIDTH ? EMPTY_CELL_WIDTH : this.options.cellMinWidth;
      return new TiptapTableView(node, cellMinWidth, HTMLAttributes);
    };
  },
});

const TableCellNode = TableCell.extend<TableCellOptions>({
  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      "Mod-a": () => {
        const { state, view } = this.editor;
        const { selection, doc } = state;

        const $anchor = selection.$anchor;
        const cellPos = cellAround($anchor);
        if (!cellPos) {
          return false;
        }

        const cellNode = doc.nodeAt(cellPos.pos);
        if (!cellNode || !cellNode.textContent) {
          return false;
        }

        const from = cellPos.pos + 1;
        const to = cellPos.pos + cellNode.nodeSize - 1;

        if (from >= to) {
          return true;
        }

        const $from = doc.resolve(from);
        const $to = doc.resolve(to);

        const nextSel = TextSelection.between($from, $to, 1);
        if (!nextSel) {
          return true;
        }

        if (state.selection.eq(nextSel)) {
          return true;
        }

        view.dispatch(state.tr.setSelection(nextSel));
        return true;
      },
    };
  },
});

export interface TableNodeOptions {
  table: Partial<TableOptions> | false;
  tableCell: Partial<TableCellOptions> | false;
  tableHeader: Partial<TableHeaderOptions> | false;
  tableRow: Partial<TableRowOptions> | false;
}

export const TableKit = Extension.create<TableNodeOptions>({
  name: "tableKit",

  addExtensions() {
    const extensions: any[] = [];

    if (this.options.table !== false) {
      extensions.push(TableNode.configure(this.options.table));
    }

    if (this.options.tableCell !== false) {
      extensions.push(TableCellNode.configure(this.options.tableCell));
    }

    if (this.options.tableHeader !== false) {
      extensions.push(TableHeader.configure(this.options.tableHeader));
    }

    if (this.options.tableRow !== false) {
      extensions.push(TableRow.configure(this.options.tableRow));
    }

    return extensions;
  },
});
