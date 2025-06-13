import "../../styles/full-editor.css"
import "@arco-design/web-react/dist/css/arco.css";
import 'mac-scrollbar/dist/mac-scrollbar.css';
import React, {memo, useEffect, useRef} from 'react';
import {useSetState} from "ahooks";
import {useEditor, EditorContent} from "@tiptap/react"
import {isEqualReact} from "@react-hookz/deep-equal";
import {MacScrollbar} from "mac-scrollbar";
import clsx from "clsx"
import {Toaster} from 'sonner'
import {FullEditorProps} from "../../domains/types/full-editor";
import {FullExtensions} from "./extenisons";
import Toolbar from "./toolbar";
import GlobalContextProvider, {ExcalidrawModalState} from "./context";
import {
    ColumnBubbleMenu,
    ExcalidrawBubbleMenu,
    IframeBubbleMenu,
    ImageBubbleMenu,
    TableBubbleMenu
} from "../../bubble-menu";
import {DEFAULT_EXCALIDRAW_DATA} from "../../extensions/excalidraw";
import {ExcalidrawModal} from "../../modals";

const FullEditor = memo((props: FullEditorProps) => {
    const {classNames, styles, hiddenToast = false, onUploadFile} = props;
    const menuContainerRef = useRef(null)
    const [excalidrawModalState, setExcalidrawModalState] = useSetState<ExcalidrawModalState>({
        open: false,
        data: {
            blockId: "",
            excalidrawData: DEFAULT_EXCALIDRAW_DATA
        }
    })

    const editor = useEditor({
        extensions: FullExtensions,
        autofocus: props?.autofocus,
        onUpdate: (editor) => {
            const text = editor.editor.getText();
            const json = editor.editor.getJSON();
            const html = editor.editor.getHTML();
            const isEmpty = !text && html === "<p></p>"
            props?.onUpdate?.({json, text, html, isEmpty})
        }
    }, [props?.autofocus])

    useEffect(() => {
        props?.content && editor && editor.commands.setContent(props?.content)
    }, [props?.content, editor])


    return (
        <GlobalContextProvider
            editor={editor}
            excalidrawModalState={excalidrawModalState}
            setExcalidrawModalState={setExcalidrawModalState}
            onUploadFile={onUploadFile}
        >
            {!hiddenToast && (<Toaster/>)}
            <div
                className={clsx("moki-full-editor-root", classNames?.root)}
                style={styles?.root}
                ref={menuContainerRef}
            >
                <Toolbar
                    className={classNames?.toolbar}
                    style={styles?.toolbar}
                />
                <MacScrollbar className="h-[calc(100%-50px)] overflow-y-scroll" suppressScrollX={false}>
                    <EditorContent
                        editor={editor}
                        className={clsx("moki-full-editor", "w-1/2 max-w-7/12 m-auto p-8", classNames?.editor)}
                        style={styles?.editor}
                    />
                </MacScrollbar>
                <ImageBubbleMenu editor={editor} appendTo={menuContainerRef}/>
                <ColumnBubbleMenu editor={editor} appendTo={menuContainerRef}/>
                <ExcalidrawBubbleMenu editor={editor} appendTo={menuContainerRef}/>
                <IframeBubbleMenu editor={editor} appendTo={menuContainerRef}/>
                <TableBubbleMenu.Row editor={editor} appendTo={menuContainerRef}/>
                <TableBubbleMenu.Column editor={editor} appendTo={menuContainerRef}/>
                <ExcalidrawModal editor={editor}/>
            </div>
        </GlobalContextProvider>
    );
}, (prevProps, nextProps) => {
    return isEqualReact(prevProps, nextProps)
});

export default FullEditor;
