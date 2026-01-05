import _TableRow from '@tiptap/extension-table-row'

export const TableRow = _TableRow.extend({
    allowGapCursor: false,
    content: 'tableCell*',
})

