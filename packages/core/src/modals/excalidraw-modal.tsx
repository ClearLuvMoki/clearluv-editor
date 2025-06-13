import React, {useCallback, useContext, useState, useRef} from 'react';
import {Context} from "../editor/full-editor/context";
import {Excalidraw} from "@excalidraw/excalidraw"
import {DEFAULT_EXCALIDRAW_DATA, Excalidraw as ExcalidrawExtension} from "../extensions/excalidraw";
import BaseEditModal from "../components/base-edit-modal";
import {ModalProps} from "../domains/types/modal";
import {ExcalidrawDataProps} from "../domains/types/excalidraw";

const ExcalidrawModal = ({editor}: ModalProps) => {
    const {excalidrawModalState, setExcalidrawModalState} = useContext(Context);
    const [data, setData] = useState<ExcalidrawDataProps>({
        elements: []
    });
    const attrs = editor?.getAttributes(ExcalidrawExtension.name);
    const blockId = attrs?.blockId;


    const onSubmit = () => {
        editor?.chain().focus().insertExcalidraw({
            data,
            blockId
        }).run();
        onClose();
    };

    const onChange = useCallback((elements, appState, files) => {
        setData({
            elements,
            appState,
            files,
        });
    }, [setData]);

    const onClose = useCallback(() => {
        setExcalidrawModalState({
            open: false,
            data: {blockId: "", excalidrawData: DEFAULT_EXCALIDRAW_DATA}
        })
    }, [setExcalidrawModalState])


    return (
        <BaseEditModal
            open={excalidrawModalState.open}
            title="Excalidraw Modal"
            onSubmit={onSubmit}
            onClose={onClose}
        >
            {
                excalidrawModalState.open && (
                    <Excalidraw
                        initialData={excalidrawModalState.data?.excalidrawData || DEFAULT_EXCALIDRAW_DATA}
                        excalidrawAPI={excalidrawRef}
                        onChange={onChange}
                        UIOptions={{
                            canvasActions: {
                                export: false,
                                saveToActiveFile: false,
                                saveAsImage: false,
                            },
                        }}
                    />
                )
            }
        </BaseEditModal>
    );
};

export default ExcalidrawModal;
