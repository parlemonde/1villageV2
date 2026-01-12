import { schema } from '@frontend/components/html/HtmlEditor/schema';
import type { Mark, Node } from 'prosemirror-model';
import type { EditorState } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';

import { isTextSelection } from './is-text-selection';

export const setColor = (state: EditorState, color: string, dispatch?: EditorView['dispatch']) => {
    if (!dispatch) {
        return;
    }
    const isDefaultColor = color === 'var(--font-color)';
    if (isTextSelection(state.selection) && state.selection.$cursor) {
        const tr = state.tr;
        tr.removeStoredMark(schema.marks.color);
        if (!isDefaultColor) {
            tr.addStoredMark(schema.marks.color.create({ color }));
        }
        dispatch(tr);
    } else {
        const tr = state.tr;
        for (let i = 0; i < state.selection.ranges.length; i++) {
            const {
                $from: { pos: from },
                $to: { pos: to },
            } = state.selection.ranges[i];
            const text = state.doc.textBetween(from, to);
            tr.removeMark(from, to, schema.marks.color);
            if (!isDefaultColor && !/^\s*$/.test(text)) {
                tr.addMark(from, to, schema.marks.color.create({ color }));
            }
        }
        dispatch(tr);
    }
};

export const getColor = (marks: readonly Mark[], selectedNodes: Node[]): string => {
    const cursorColor = schema.marks.color.isInSet(marks)?.attrs.color || null;
    const colors = cursorColor
        ? new Set([cursorColor])
        : new Set(
              selectedNodes
                  .filter((n) => n.isText)
                  .map((n) => n.marks.find((m) => m.type === schema.marks.color)?.attrs.color || 'var(--font-color)'),
          );
    return colors.size === 1 ? Array.from(colors)[0] || 'var(--font-color)' : 'var(--font-color)';
};
