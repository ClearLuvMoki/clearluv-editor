import {
    Bold,
    Color,
    Document,
    FontFamily,
    HardBreak,
    Highlight,
    Italic,
    Paragraph,
    Placeholder,
    Strike,
    Subscript,
    Superscript,
    Text,
    TextStyle,
    Underline,
} from '@/extensions'

export const Extensions: any[] = [
    Document,
    Paragraph,
    Text,
    Placeholder.configure({
        showOnlyCurrent: true,
        placeholder: ({ node }) => {
            if (['codeBlock', 'taskList'].includes(node.type.name)) {
                return ''
            }
            return 'Write some for self...'
        },
    }),
    Bold,
    Italic,
    Underline,
    Strike,
    Subscript,
    Superscript,
    Highlight.configure({ multicolor: true }),
    TextStyle,
    Color,
    FontFamily,
    HardBreak,
]
