import React from "react";
import {Editor, Node, posToDOMRect} from "@tiptap/core";
import {ReactRenderer} from "@tiptap/react";
import Suggestion from "@tiptap/suggestion";
import tippy, {Instance} from "tippy.js";

import {PluginKey as PMPluginKey} from "@tiptap/pm/state";
// import SlashNode from "../nodes/slash-node"


const SlashNode = () => {
    return null
}

const EXTENSION_PRIORITY_HIGHEST = 200;

export type SlashMenuItem = {
    title: string;
    children: {
        icon: React.ReactNode;
        text: string;
        slash: string;
        action: (editor: Editor) => void;
    }[]
}


export interface SlashOptions {
    items: SlashMenuItem[];
    pluginKey: string;
    char: string;
}

export const Slash = (name: string, options?: SlashOptions) => {
    return Node.create<SlashOptions>({
        name: name,
        priority: EXTENSION_PRIORITY_HIGHEST,

        addOptions() {
            return {
                char: "/",
                pluginKey: "slash",
                items: [],
                ...(options ?? {})
            };
        },

        addProseMirrorPlugins() {
            return [
                Suggestion({
                    editor: this.editor,
                    char: this.options.char,
                    pluginKey: new PMPluginKey(this.options.pluginKey),

                    command: ({editor, props}) => {
                        const {state, dispatch} = editor.view;
                        const {$head, $from} = state.selection;

                        const end = $from.pos;
                        const from = $head?.nodeBefore?.text
                            ? end -
                            $head.nodeBefore.text.substring(
                                $head.nodeBefore.text.indexOf("/")
                            ).length
                            : $from.start();

                        const tr = state.tr.deleteRange(from, end);
                        dispatch(tr);
                        props?.action?.(editor, props.user);
                        editor?.view?.focus();
                    },

                    items: ({query}) => {
                        if (!query) return this.options.items;
                        const filter = (this.options.items || []).map(item => {
                            return {
                                ...item,
                                children: (item.children || []).filter(child => child?.slash?.indexOf(query) > -1 || child?.text?.indexOf(query) > -1) || []
                            }
                        }).filter(item => item.children?.length > 0) || []
                        return filter;
                    },

                    render: () => {
                        let component: ReactRenderer;
                        let popup: Instance[];
                        let isEditable: boolean;

                        const getReferenceClientRect = () => {
                            const {ranges} = this.editor.state.selection;
                            const from = Math.min(...ranges.map(range => range.$from.pos));
                            const to = Math.max(...ranges.map(range => range.$to.pos));
                            return posToDOMRect(this.editor.view, from, to);
                        };

                        return {
                            onStart: props => {
                                isEditable = props.editor.isEditable;
                                if (!isEditable) return;

                                component = new ReactRenderer(SlashNode, {
                                    props,
                                    editor: props.editor
                                });

                                popup = tippy(".moki-full-editor-root", {
                                    getReferenceClientRect,
                                    appendTo: () => document.getElementsByClassName("moki-full-editor-root")?.[0],
                                    content: component.element,
                                    showOnCreate: true,
                                    interactive: true,
                                    trigger: "manual",
                                    placement: "bottom-start"
                                });
                            },

                            onUpdate(props) {
                                if (!isEditable) return;
                                component.updateProps(props);
                                popup[0].setProps({
                                    // @ts-ignore
                                    getReferenceClientRect: props.clientRect
                                });
                            },

                            onKeyDown(props) {
                                if (!isEditable) return;

                                if (props.event.key === "Escape") {
                                    popup[0].hide();
                                    return true;
                                }
                                // @ts-ignore
                                return component.ref?.onKeyDown(props);
                            },

                            onExit() {
                                if (!isEditable) return;
                                popup[0].destroy();
                                component.destroy();
                            }
                        };
                    }
                })
            ];
        }
    })
};
