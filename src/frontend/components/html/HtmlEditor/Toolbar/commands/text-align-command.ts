import type { Node } from 'prosemirror-model';
import type { EditorState } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';

export type TextAlign = 'left' | 'center' | 'right' | 'justify';

const TEXT_ALIGN_VALUES = new Set(['left', 'center', 'right', 'justify']);
const isTextAlign = (value: string): value is TextAlign => {
    return TEXT_ALIGN_VALUES.has(value);
};
const toTextAlign = (node: Node): TextAlign => {
    return isTextAlign(node.attrs.align) ? node.attrs.align : 'left';
};

export const setTextAlign = (state: EditorState, align: string, dispatch?: EditorView['dispatch']) => {
    if (!dispatch || !isTextAlign(align)) {
        return;
    }
    const tr = state.tr;
    for (let i = 0; i < state.selection.ranges.length; i++) {
        const {
            $from: { pos: from },
            $to: { pos: to },
        } = state.selection.ranges[i];
        state.doc.nodesBetween(from, to, (node, pos) => {
            if (node.isBlock) {
                tr.setNodeAttribute(pos, 'align', align);
            }
        });
    }
    dispatch(tr);
};

export const getTextAlign = (selectedNodes: Node[]): TextAlign | '' => {
    const textAligns = new Set(selectedNodes.filter((n) => n.isBlock).map(toTextAlign));
    return textAligns.size === 1 ? Array.from(textAligns)[0] || '' : '';
};
