import React, { createContext, useState } from "react";
import { Editor } from "@tiptap/react";


interface Props {
    children: React.ReactNode;
}

export interface ExcalidrawModalState {
    open: boolean;
    data: {
        blockId: string;
        excalidrawData: null
    } | null
}

export interface FlowModalState {
    open: boolean;
    data: {
        blockId: string;
        flowData: string
    } | null
}

interface ContextState {
    editor: Editor | null;
    excalidrawModalState: ExcalidrawModalState | null;
    setExcalidrawModalState: React.Dispatch<ExcalidrawModalState> | null;
    flowModalState: FlowModalState | null;
    setFlowModalState: React.Dispatch<FlowModalState> | null;
}

// @ts-ignore
export const Context = createContext<ContextState>(null);

const GlobalContextProvider = ({ editor, excalidrawModalState, setExcalidrawModalState, flowModalState, setFlowModalState, children }: ContextState & Props) => {

    return <Context.Provider
        value={{
            editor,
            excalidrawModalState,
            setExcalidrawModalState,
            flowModalState,
            setFlowModalState
        }}
    >
        {children}
    </Context.Provider>
}

export default GlobalContextProvider;
