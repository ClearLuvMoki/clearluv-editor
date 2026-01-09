import {
  type Editor,
  findParentNodeClosestToPos,
  isNodeSelection,
  isTextSelection,
  type NodeWithPos,
  posToDOMRect,
} from "@tiptap/core";

import type { Node as PMNode, Node as TiptapNode } from "@tiptap/pm/model";
import { NodeSelection, Selection, TextSelection, type Transaction } from "@tiptap/pm/state";
import { type ClassValue, clsx } from "clsx";
import { CellSelection, cellAround } from "prosemirror-tables";
import { twMerge } from "tailwind-merge";
import type { ListType } from "@/extensions/bullet-list";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function isNodeInSchema(nodeName: string, editor: Editor | null) {
  if (!editor?.schema) return false;
  return editor.schema.spec.nodes.get(nodeName) !== undefined;
}

export function isExtensionAvailable(
  editor: Editor | null,
  extensionNames: string | string[],
): boolean {
  if (!editor) return false;

  const names = Array.isArray(extensionNames) ? extensionNames : [extensionNames];

  const found = names.some((name) =>
    editor.extensionManager.extensions.some((ext) => ext.name === name),
  );

  if (!found) {
    console.warn(
      `None of the extensions [${names.join(", ")}] were found in the editor schema. Ensure they are included in the editor configuration.`,
    );
  }

  return found;
}

export function canResetMarks(tr: Transaction, skip: string[] = []): boolean {
  const { selection } = tr;
  const { empty, ranges } = selection;

  if (empty) return false;

  for (const range of ranges) {
    const from = range.$from.pos;
    const to = range.$to.pos;

    let hasRemovableMarks = false;

    tr.doc.nodesBetween(from, to, (node) => {
      if (!node.isInline) return true;

      for (const mark of node.marks) {
        if (!skip.includes(mark.type.name)) {
          hasRemovableMarks = true;
          return false;
        }
      }

      return true;
    });

    if (hasRemovableMarks) {
      return true;
    }
  }

  return false;
}

export const isMarkInSchema = (markName: string, editor: Editor | null): boolean => {
  if (!editor?.schema) return false;
  return editor.schema.spec.marks.get(markName) !== undefined;
};

export function isNodeTypeSelected(editor: Editor | null, types: string[] = []): boolean {
  if (!editor || !editor.state.selection) return false;

  const { state } = editor;
  const { selection } = state;

  if (selection.empty) return false;

  if (selection instanceof NodeSelection) {
    const node = selection.node;
    return node ? types.includes(node.type.name) : false;
  }

  return false;
}

export function findNodeAtPosition(editor: Editor, position: number) {
  try {
    const node = editor.state.doc.nodeAt(position);
    if (!node) {
      console.warn(`No node found at position ${position}`);
      return null;
    }
    return node;
  } catch (error) {
    console.error(`Error getting node at position ${position}:`, error);
    return null;
  }
}

export function findNodePosition(props: {
  editor: Editor | null;
  node?: TiptapNode | null;
  nodePos?: number | null;
}): { pos: number; node: TiptapNode } | null {
  const { editor, node, nodePos } = props;

  if (!editor || !editor.state?.doc) return null;

  // Zero is valid position
  const hasValidNode = node !== undefined && node !== null;
  const hasValidPos = isValidPosition(nodePos);

  if (!hasValidNode && !hasValidPos) {
    return null;
  }

  // First search for the node in the document if we have a node
  if (hasValidNode) {
    let foundPos = -1;
    let foundNode: TiptapNode | null = null;

    editor.state.doc.descendants((currentNode, pos) => {
      // TODO: Needed?
      // if (currentNode.type && currentNode.type.name === node!.type.name) {
      if (currentNode === node) {
        foundPos = pos;
        foundNode = currentNode;
        return false;
      }
      return true;
    });

    if (foundPos !== -1 && foundNode !== null) {
      return { pos: foundPos, node: foundNode };
    }
  }

  // If we have a valid position, use findNodeAtPosition
  if (hasValidPos) {
    const nodeAtPos = findNodeAtPosition(editor, nodePos!);
    if (nodeAtPos) {
      return { pos: nodePos!, node: nodeAtPos };
    }
  }

  return null;
}

export function isValidPosition(pos: number | null | undefined): pos is number {
  return typeof pos === "number" && pos >= 0;
}

export function isParagraphActive(editor: Editor | null): boolean {
  if (!editor) return false;
  return editor.isActive("paragraph");
}

export function canToggleText(editor: Editor | null, turnInto: boolean = true): boolean {
  if (!editor) return false;
  if (!isNodeInSchema("paragraph", editor) || isNodeTypeSelected(editor, ["image"])) return false;

  if (!turnInto) {
    return editor.can().setNode("paragraph");
  }

  try {
    const view = editor.view;
    const state = view.state;
    const selection = state.selection;

    if (selection.empty || selection instanceof TextSelection) {
      const pos = findNodePosition({
        editor,
        node: state.selection.$anchor.node(1),
      })?.pos;
      if (!isValidPosition(pos)) return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function toggleParagraph(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canToggleText(editor)) return false;

  try {
    const view = editor.view;
    let state = view.state;
    let tr = state.tr;

    // No selection, find the the cursor position
    if (state.selection.empty || state.selection instanceof TextSelection) {
      const pos = findNodePosition({
        editor,
        node: state.selection.$anchor.node(1),
      })?.pos;
      if (!isValidPosition(pos)) return false;

      tr = tr.setSelection(NodeSelection.create(state.doc, pos));
      view.dispatch(tr);
      state = view.state;
    }

    const selection = state.selection;
    let chain = editor.chain().focus();

    // Handle NodeSelection
    if (selection instanceof NodeSelection) {
      const firstChild = selection.node.firstChild?.firstChild;
      const lastChild = selection.node.lastChild?.lastChild;

      const from = firstChild ? selection.from + firstChild.nodeSize : selection.from + 1;

      const to = lastChild ? selection.to - lastChild.nodeSize : selection.to - 1;

      chain = chain.setTextSelection({ from, to }).clearNodes();
    }

    if (!editor.isActive("paragraph")) {
      chain.setNode("paragraph").run();
    }

    editor.chain().focus().selectTextblockEnd().run();

    return true;
  } catch {
    return false;
  }
}

export function canToggleList(
  editor: Editor | null,
  type: ListType,
  turnInto: boolean = true,
): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isNodeInSchema(type, editor) || isNodeTypeSelected(editor, ["image"])) return false;

  if (!turnInto) {
    switch (type) {
      case "bulletList":
        return editor.can().toggleBulletList();
      case "orderedList":
        return editor.can().toggleOrderedList();
      case "taskList":
        return editor.can().toggleList("taskList", "taskItem");
      default:
        return false;
    }
  }

  try {
    const view = editor.view;
    const state = view.state;
    const selection = state.selection;

    if (selection.empty || selection instanceof TextSelection) {
      const pos = findNodePosition({
        editor,
        node: state.selection.$anchor.node(1),
      })?.pos;
      if (!isValidPosition(pos)) return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function isListActive(editor: Editor | null, type: ListType): boolean {
  if (!editor || !editor.isEditable) return false;

  switch (type) {
    case "bulletList":
      return editor.isActive("bulletList");
    case "orderedList":
      return editor.isActive("orderedList");
    case "taskList":
      return editor.isActive("taskList");
    default:
      return false;
  }
}

export function toggleList(editor: Editor | null, type: ListType): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canToggleList(editor, type)) return false;

  try {
    const view = editor.view;
    let state = view.state;
    let tr = state.tr;

    // No selection, find the the cursor position
    if (state.selection.empty || state.selection instanceof TextSelection) {
      const pos = findNodePosition({
        editor,
        node: state.selection.$anchor.node(1),
      })?.pos;
      if (!isValidPosition(pos)) return false;

      tr = tr.setSelection(NodeSelection.create(state.doc, pos));
      view.dispatch(tr);
      state = view.state;
    }

    const selection = state.selection;

    let chain = editor.chain().focus();

    // Handle NodeSelection
    if (selection instanceof NodeSelection) {
      const firstChild = selection.node.firstChild?.firstChild;
      const lastChild = selection.node.lastChild?.lastChild;

      const from = firstChild ? selection.from + firstChild.nodeSize : selection.from + 1;

      const to = lastChild ? selection.to - lastChild.nodeSize : selection.to - 1;

      chain = chain.setTextSelection({ from, to }).clearNodes();
    }

    if (editor.isActive(type)) {
      // Unwrap list
      chain.liftListItem("listItem").lift("bulletList").lift("orderedList").lift("taskList").run();
    } else {
      // Wrap in specific list type
      const toggleMap: Record<ListType, () => typeof chain> = {
        bulletList: () => chain.toggleBulletList(),
        orderedList: () => chain.toggleOrderedList(),
        taskList: () => chain.toggleList("taskList", "taskItem"),
      };

      const toggle = toggleMap[type];
      if (!toggle) return false;

      toggle().run();
    }

    editor.chain().focus().selectTextblockEnd().run();

    return true;
  } catch {
    return false;
  }
}

export function canDuplicateNode(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;

  try {
    const { state } = editor;
    const { selection } = state;

    if (selection instanceof NodeSelection) {
      return !!selection.node;
    }

    const $anchor = selection.$anchor.node(1);

    return !!$anchor;
  } catch {
    return false;
  }
}

export function duplicateNode(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;

  try {
    const { state } = editor;
    const { selection } = state;
    const chain = editor.chain().focus();

    if (selection instanceof NodeSelection) {
      const selectedNode = selection.node;
      const insertPos = selection.to;

      chain.insertContentAt(insertPos, selectedNode.toJSON()).run();
      return true;
    }

    const $anchor = selection.$anchor;

    for (let depth = 1; depth <= $anchor.depth; depth++) {
      const node = $anchor.node(depth);

      if (node.type.name === "doc" || !node.type.spec.group) {
        continue;
      }

      const nodeStart = $anchor.start(depth);
      const insertPos = Math.min(nodeStart + node.nodeSize, state.doc.content.size);

      chain.insertContentAt(insertPos, node.toJSON()).run();
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

export function canDeleteNode(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;

  const { state } = editor;
  const { selection } = state;

  if (selection instanceof NodeSelection) {
    return true;
  }

  const $pos = selection.$anchor;

  for (let depth = $pos.depth; depth > 0; depth--) {
    const node = $pos.node(depth);
    const pos = $pos.before(depth);

    // Check if we could delete the range from pos to pos + nodeSize
    const tr = state.tr.delete(pos, pos + node.nodeSize);
    if (tr.doc !== state.doc) {
      return true;
    }
  }

  return false;
}

export function deleteNodeAtPosition(editor: Editor, pos: number, nodeSize: number): boolean {
  const chain = editor.chain().focus();
  const success = chain.deleteRange({ from: pos, to: pos + nodeSize }).run();

  if (success) return true;

  // Fallback
  return chain.setNodeSelection(pos).deleteSelection().run();
}

export function deleteNode(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;

  try {
    const { state } = editor;
    const { selection } = state;

    if (selection instanceof NodeSelection) {
      const pos = selection.from;
      const selectedNode = selection.node;

      if (!selectedNode) return false;

      return deleteNodeAtPosition(editor, pos, selectedNode.nodeSize);
    }

    const $pos = selection.$anchor;

    for (let depth = $pos.depth; depth > 0; depth--) {
      const node = $pos.node(depth);
      const pos = $pos.before(depth);

      if (node && node.isBlock) {
        return deleteNodeAtPosition(editor, pos, node.nodeSize);
      }
    }

    return false;
  } catch {
    return false;
  }
}

export function canInsertSlashCommand(
  editor: Editor | null,
  node?: TiptapNode | null,
  nodePos?: number | null,
): boolean {
  if (!editor || !editor.isEditable) return false;
  if (isNodeTypeSelected(editor, ["image"])) return false;

  if (node || isValidPosition(nodePos)) {
    if (isValidPosition(nodePos) && nodePos! >= 0) return true;

    if (node) {
      const foundPos = findNodePosition({ editor, node });
      return foundPos !== null;
    }
  }

  return true;
}

/**
 * Inserts a slash command at a specified node position or after the current selection
 */
export function insertSlashCommand(
  editor: Editor | null,
  trigger: string = "/",
  node?: TiptapNode | null,
  nodePos?: number | null,
): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canInsertSlashCommand(editor, node, nodePos)) return false;

  try {
    if ((node !== undefined && node !== null) || isValidPosition(nodePos)) {
      const foundPos = findNodePosition({
        editor,
        node: node || undefined,
        nodePos: nodePos || undefined,
      });

      if (!foundPos) {
        return false;
      }

      const isEmpty = foundPos.node.type.name === "paragraph" && foundPos.node.content.size === 0;
      const insertPos = isEmpty ? foundPos.pos : foundPos.pos + foundPos.node.nodeSize;

      editor.view.dispatch(
        editor.view.state.tr.scrollIntoView().insertText(trigger, insertPos, insertPos),
      );

      const triggerLength = trigger.length + 1; // +1 for the space after the trigger
      const focusPos = isEmpty
        ? foundPos.pos + triggerLength
        : foundPos.pos + foundPos.node.nodeSize + triggerLength;
      editor.commands.focus(focusPos);

      return true;
    }

    const { $from } = editor.state.selection;
    const currentNode = $from.node();
    const isEmpty = currentNode.textContent.length === 0;
    const isStartOfBlock = $from.parentOffset === 0;

    // Check if we're at the document node level
    // This is important if we dont have focus on the editor
    // and we want to insert the slash at the end of the document
    const isTopLevel = $from.depth === 0;

    if (!isEmpty || !isStartOfBlock) {
      const insertPosition = isTopLevel ? editor.state.doc.content.size : $from.after();

      return editor
        .chain()
        .insertContentAt(insertPosition, {
          type: "paragraph",
          content: [{ type: "text", text: trigger }],
        })
        .focus()
        .run();
    }

    return editor.chain().insertContent({ type: "text", text: trigger }).focus().run();
  } catch {
    return false;
  }
}

export function updateNodesAttr<A extends string = string, V = unknown>(
  tr: Transaction,
  targets: readonly NodeWithPos[],
  attrName: A,
  next: V | ((prev: V | undefined) => V | undefined),
): boolean {
  if (!targets.length) return false;

  let changed = false;

  for (const { pos } of targets) {
    // Always re-read from the transaction's current doc
    const currentNode = tr.doc.nodeAt(pos);
    if (!currentNode) continue;

    const prevValue = (currentNode.attrs as Record<string, unknown>)[attrName] as V | undefined;
    const resolvedNext =
      typeof next === "function" ? (next as (p: V | undefined) => V | undefined)(prevValue) : next;

    if (prevValue === resolvedNext) continue;

    const nextAttrs: Record<string, unknown> = { ...currentNode.attrs };
    if (resolvedNext === undefined) {
      // Remove the key entirely instead of setting null
      delete nextAttrs[attrName];
    } else {
      nextAttrs[attrName] = resolvedNext;
    }

    tr.setNodeMarkup(pos, undefined, nextAttrs);
    changed = true;
  }

  return changed;
}

export function getSelectedNodesOfType(
  selection: Selection,
  allowedNodeTypes: string[],
): NodeWithPos[] {
  const results: NodeWithPos[] = [];
  const allowed = new Set(allowedNodeTypes);

  if (selection instanceof CellSelection) {
    selection.forEachCell((node: PMNode, pos: number) => {
      if (allowed.has(node.type.name)) {
        results.push({ node, pos });
      }
    });
    return results;
  }

  if (selection instanceof NodeSelection) {
    const { node, from: pos } = selection;
    if (node && allowed.has(node.type.name)) {
      results.push({ node, pos });
    }
    return results;
  }

  // @ts-ignore
  const { $anchor } = selection;
  const cell = cellAround($anchor);

  if (cell) {
    // @ts-ignore
    const cellNode = selection.$anchor.doc.nodeAt(cell.pos);
    if (cellNode && allowed.has(cellNode.type.name)) {
      results.push({ node: cellNode, pos: cell.pos });
      return results;
    }
  }

  // Fallback: find parent nodes of allowed types
  const parentNode = findParentNodeClosestToPos($anchor, (node) => allowed.has(node.type.name));

  if (parentNode) {
    results.push({ node: parentNode.node, pos: parentNode.pos });
  }

  return results;
}

export const isSelectionValid = (
  editor: Editor | null,
  selection?: any,
  excludedNodeTypes: string[] = ["imageUpload", "horizontalRule"],
): boolean => {
  if (!editor) return false;
  if (!selection) selection = editor.state.selection;

  const { state } = editor;
  const { doc } = state;
  const { empty, from, to } = selection;

  const isEmptyTextBlock = !doc.textBetween(from, to).length && isTextSelection(selection);
  const isCodeBlock =
    selection.$from.parent.type.spec.code ||
    (isNodeSelection(selection) && selection.node.type.spec.code);
  const isExcludedNode =
    isNodeSelection(selection) && excludedNodeTypes.includes(selection.node.type.name);
  const isTableCell = selection instanceof CellSelection;

  return !empty && !isEmptyTextBlock && !isCodeBlock && !isExcludedNode && !isTableCell;
};

export const getSelectionBoundingRect = (editor: Editor): DOMRect | null => {
  const { state } = editor.view;
  const { selection } = state;
  const { ranges } = selection;

  const from = Math.min(...ranges.map((range) => range.$from.pos));
  const to = Math.max(...ranges.map((range) => range.$to.pos));

  if (isNodeSelection(selection)) {
    const node = editor.view.nodeDOM(from) as HTMLElement;
    if (node) {
      return node.getBoundingClientRect();
    }
  }

  return posToDOMRect(editor.view, from, to);
};

export const isElementWithinEditor = (editor: Editor | null, element: Node | null) => {
  if (!element || !editor) {
    return false;
  }

  const editorWrapper = editor.view.dom.parentElement;
  const editorDom = editor.view.dom;

  if (!editorWrapper) {
    return false;
  }

  return editorWrapper === element || editorDom === element || editorWrapper.contains(element);
};

type ProtocolOptions = {
  /**
   * The protocol scheme to be registered.
   * @default '''
   * @example 'ftp'
   * @example 'git'
   */
  scheme: string;

  /**
   * If enabled, it allows optional slashes after the protocol.
   * @default false
   * @example true
   */
  optionalSlashes?: boolean;
};

type ProtocolConfig = Array<ProtocolOptions | string>;

const ATTR_WHITESPACE =
  // biome-ignore lint/suspicious/noControlCharactersInRegex: <ignore error>
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g;

export function isAllowedUri(uri: string | undefined, protocols?: ProtocolConfig) {
  const allowedProtocols: string[] = [
    "http",
    "https",
    "ftp",
    "ftps",
    "mailto",
    "tel",
    "callto",
    "sms",
    "cid",
    "xmpp",
  ];

  if (protocols) {
    protocols.forEach((protocol) => {
      const nextProtocol = typeof protocol === "string" ? protocol : protocol.scheme;

      if (nextProtocol) {
        allowedProtocols.push(nextProtocol);
      }
    });
  }

  return (
    !uri ||
    uri.replace(ATTR_WHITESPACE, "").match(
      new RegExp(
        // eslint-disable-next-line no-useless-escape
        `^(?:(?:${allowedProtocols.join("|")}):|[^a-z]|[a-z0-9+.\-]+(?:[^a-z+.\-:]|$))`,
        "i",
      ),
    )
  );
}

export function sanitizeUrl(inputUrl: string, baseUrl: string, protocols?: any): string {
  try {
    const url = new URL(inputUrl, baseUrl);

    if (isAllowedUri(url.href, protocols)) {
      return url.href;
    }
  } catch {
    // If URL creation fails, it's considered invalid
  }
  return "#";
}

export function focusNextNode(editor: Editor) {
  const { state, view } = editor;
  const { doc, selection } = state;

  const nextSel = (Selection as any).findFrom(selection.$to, 1, true);
  if (nextSel) {
    view.dispatch(state.tr.setSelection(nextSel).scrollIntoView());
    return true;
  }

  const paragraphType = state.schema.nodes.paragraph;
  if (!paragraphType) {
    console.warn("No paragraph node type found in schema.");
    return false;
  }

  const end = doc.content.size;
  const para = paragraphType.create();
  let tr = state.tr.insert(end, para);

  // Place the selection inside the new paragraph
  const $inside = tr.doc.resolve(end + 1);
  tr = tr.setSelection(TextSelection.near($inside)).scrollIntoView();
  view.dispatch(tr);
  return true;
}
