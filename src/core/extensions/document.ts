import { Document as _Document } from '@tiptap/extension-document'

export const Document = _Document.extend({
    content: '(block)+',
    addKeyboardShortcuts() {
        return {
            Tab: ({editor}) => {
                editor.chain().insertContent("\t").run()
                return true
            }
        }
    }
})
