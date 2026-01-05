// import clsx from 'clsx'
// import React, { useRef } from 'react'
// import type { BaseEditorProps } from '@/domains/types/base-editor'
// import { BaseEditor } from '@/editor'
// import { Extensions } from '@/editor/base-editor/extensions'
// import {
//     Blockquote,
//     BulletList,
//     Code,
//     CodeBlock,
//     HardBreak,
//     Heading,
//     History,
//     Link,
//     ListItem,
//     OrderedList,
//     TaskItem,
//     TaskList,
//     TrailingNode,
// } from '@/extensions'
// import useEditor from '@/hooks/use-editor'
// import { StyledContainer } from './styled'
// import Toolbar from './toolbar'
//
// interface Props {
//     theme?: 'light' | 'dark'
//     classNames?: {
//         root?: string
//         toolbar?: string
//         base?: BaseEditorProps['classNames']
//     }
//     styles?: {
//         root?: React.CSSProperties
//         toolbar?: React.CSSProperties
//         base?: BaseEditorProps['styles']
//     }
//     onUpdate?: BaseEditorProps['onUpdate']
// }
//
// const SimpleEditor = (props: Props) => {
//     const { theme = 'light', classNames, styles, onUpdate } = props
//     const menuContainerRef = useRef(null)
//
//     const editor = useEditor({
//         extensions: [
//             ...Extensions,
//             Heading,
//             Code,
//             Blockquote,
//             OrderedList,
//             BulletList,
//             ListItem,
//             TaskList,
//             TaskItem,
//             Link,
//             CodeBlock,
//             History,
//             HardBreak,
//             TrailingNode,
//         ],
//         onUpdate: editor => {
//             const text = editor.editor.getText()
//             const json = editor.editor.getJSON()
//             const html = editor.editor.getHTML()
//             const isEmpty = !text && html === '<p></p>'
//             onUpdate?.({ json, text, html, isEmpty })
//         },
//     })
//
//     return (
//         <StyledContainer
//             className={clsx('moki-simple-editor-root', classNames?.root)}
//             style={styles?.root}
//             ref={menuContainerRef}
//         >
//             <Toolbar editor={editor!} className={classNames?.toolbar} style={styles?.toolbar} />
//             <BaseEditor theme={theme} editor={editor!} classNames={classNames?.base} styles={styles?.base} />
//         </StyledContainer>
//     )
// }
//
// export default SimpleEditor

export function SimpleEditor() {
  return <div>12</div>;
}
