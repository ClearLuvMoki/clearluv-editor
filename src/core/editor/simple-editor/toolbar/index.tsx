import type { Editor } from '@tiptap/core'
import { Button, Divider } from 'antd'
import clsx from 'clsx'
import { Bold, Braces, Italic, List, ListOrdered, Strikethrough, TextQuote, Underline } from 'lucide-react'
import { ToolsEnum } from '@/domains/enum/tools'
import { Tools } from '@/utils/tools'
import { StyledContainer } from './styled'

interface Props {
    editor: Editor
    className?: string
    style?: React.CSSProperties
}

const ToolbarIconProps = {
    size: 16,
}

const ActionsArr = [
    { icon: <Bold {...ToolbarIconProps} />, type: ToolsEnum.Bold },
    { icon: <Italic {...ToolbarIconProps} />, type: ToolsEnum.Italic },
    { icon: <Strikethrough {...ToolbarIconProps} />, type: ToolsEnum.Strike },
    { icon: <Underline {...ToolbarIconProps} />, type: ToolsEnum.Underline },
    { isDivider: true },
    { icon: <List {...ToolbarIconProps} />, type: ToolsEnum.BulletList },
    { icon: <ListOrdered {...ToolbarIconProps} />, type: ToolsEnum.OrderedList },
    { icon: <TextQuote {...ToolbarIconProps} />, type: ToolsEnum.Blockquote },
    { isDivider: true },
    { icon: <Braces {...ToolbarIconProps} />, type: ToolsEnum.CodeBlock },
]

const Toolbar = ({ editor, className, style }: Props) => {
    return (
        <StyledContainer className={clsx('moki-simple-editor-toobar', className)} style={style}>
            {ActionsArr.map((item, index) => {
                if (item?.isDivider) {
                    return <Divider layout="vertical" key={index} />
                }
                const isActive = item?.type && Boolean(item?.type === 'textAlign' || editor?.isActive(item?.type))
                return (
                    <Button
                        type="primary"
                        theme={isActive ? 'light' : 'borderless'}
                        key={item.type}
                        icon={item.icon}
                        style={{ color: isActive ? '#000' : '#717182' }}
                        onClick={() => Tools.onActions(editor, item?.type)}
                    />
                )
            })}
        </StyledContainer>
    )
}

export default Toolbar
