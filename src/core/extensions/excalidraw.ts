import { mergeAttributes, Node, nodeInputRule } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { NodeSelection } from "@tiptap/pm/state";
import { isNodeEmpty } from "../utils/node";
// import ExcalidrawNode from "../nodes/ExcalidrawNode";
import {uuid} from "../utils/uuid";
import {ExcalidrawDataProps} from "../domains/types/excalidraw";

export const DEFAULT_EXCALIDRAW_DATA = { elements: [] };

export interface IExcalidrawAttrs {
    showPickerOnCreate?: boolean;
    width?: number | string;
    height?: number;
    data?: ExcalidrawDataProps;
    blockId: string;
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        excalidraw: {
            insertExcalidraw: (attrs?: IExcalidrawAttrs) => ReturnType;
        };
    }
}



export const Excalidraw = Node.create({
    name: "excalidraw",
    group: "block",
    selectable: true,
    atom: true,
    draggable: true,
    inline: false,

    addAttributes() {
        return {
            blockId: {
                default: ""
            },
            showPickerOnCreate: {
                default: false
            },
            width: {
                default: "100%"
            },
            height: {
                default: 240
            },
            data: {
                default: DEFAULT_EXCALIDRAW_DATA
            }
        };
    },

    addOptions() {
        return {
            HTMLAttributes: {
                class: "excalidraw"
            }
        };
    },

    parseHTML() {
        return [
            {
                tag: "div[class=excalidraw]"
            }
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            "div",
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)
        ];
    },

    addCommands() {
        return {
            insertExcalidraw: _attrs => ({ tr, commands, chain, state }) => {
                const blockId = _attrs?.blockId || uuid();
                let attrs = {
                    ..._attrs,
                    data: _attrs?.data || DEFAULT_EXCALIDRAW_DATA,
                    blockId
                }

                // @ts-ignore
                if (tr.selection?.node?.type?.name == this.name) {
                    return commands.updateAttributes(this.name, attrs);
                }

                const { selection } = state;
                const currentNode = selection.$head.node(selection.$head.depth);
                const isEmpty = currentNode ? isNodeEmpty(currentNode) : true;
                const insertPos = !isEmpty
                    ? state.tr.selection.from + 1
                    : state.tr.selection.from - 1;

                return chain()
                    .command(({ tr, dispatch, state }) => {
                        if (dispatch) {
                            tr.insert(
                                insertPos,
                                state.schema.nodes[this.name].create(attrs)
                            ).setSelection(NodeSelection.create(tr.doc, insertPos));

                            dispatch(tr);
                        }

                        return true;
                    })
                    .run();
            }
        };
    },

    // addNodeView() {
    //     // return ReactNodeViewRenderer(ExcalidrawNode);
    // },

    addInputRules() {
        return [
            nodeInputRule({
                find: /^\$excalidraw\$$/,
                type: this.type,
                getAttributes: () => {
                    return { width: "100%" };
                }
            })
        ];
    }
});
