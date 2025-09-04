import type { Selection, TextSelection } from 'prosemirror-state';

export const isTextSelection = (selection: Selection): selection is TextSelection => {
    return '$cursor' in selection;
};
