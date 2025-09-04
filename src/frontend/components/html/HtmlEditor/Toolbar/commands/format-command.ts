import { chainCommands, toggleMark } from 'prosemirror-commands';
import type { Mark } from 'prosemirror-model';
import type { Command, EditorState } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';

import { schema } from '../../schema';

export const FORMAT_COMMANDS = {
    bold: toggleMark(schema.marks.bold),
    italic: toggleMark(schema.marks.italic),
    underline: toggleMark(schema.marks.underline),
};

export const getFormat = (state: EditorState, marks: readonly Mark[]): string[] => {
    let isBold = schema.marks.bold.isInSet(marks) !== undefined;
    let isItalic = schema.marks.italic.isInSet(marks) !== undefined;
    let isUnderline = schema.marks.underline.isInSet(marks) !== undefined;
    for (let i = 0; i < state.selection.ranges.length; i++) {
        const {
            $from: { pos: from },
            $to: { pos: to },
        } = state.selection.ranges[i];
        isBold = isBold || state.doc.rangeHasMark(from, to, schema.marks.bold);
        isItalic = isItalic || state.doc.rangeHasMark(from, to, schema.marks.italic);
        isUnderline = isUnderline || state.doc.rangeHasMark(from, to, schema.marks.underline);
    }
    return Object.entries({
        bold: isBold,
        italic: isItalic,
        underline: isUnderline,
    })
        .filter(([_, value]) => value)
        .map(([key]) => key);
};

export const setFormat = (state: EditorState, value: string[], newValue: string[], dispatch?: EditorView['dispatch']) => {
    if (!dispatch) {
        return;
    }
    const commands: Command[] = [];
    for (const format of ['bold', 'italic', 'underline'] as const) {
        if ((newValue.includes(format) && !value.includes(format)) || (!newValue.includes(format) && value.includes(format))) {
            commands.push(FORMAT_COMMANDS[format]);
        }
    }
    if (commands.length > 0) {
        chainCommands(...commands)(state, dispatch);
    }
};
