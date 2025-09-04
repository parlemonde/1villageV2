import type { EditorState } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';

import { isTextSelection } from './is-text-selection';
import { schema } from '../../schema';

export const getLinkAtSelection = (state: EditorState) => {
    let title = '';
    let url = '';
    let start: number | null = null;
    let end: number | null = null;
    const cursor = isTextSelection(state.selection) ? state.selection.$cursor : null;
    if (cursor) {
        // get all links in the node
        const links: { start: number; end: number; url: string }[] = [];
        cursor.parent.content.forEach((node, pos) => {
            if (!node.isText) {
                return;
            }
            const link = schema.marks.link.isInSet(node.marks || []) || null;
            if (link) {
                links.push({ start: pos, end: pos + node.nodeSize, url: link.attrs.href });
                return;
            }
        });
        // concatenate links that are contiguous
        let contiguousLinks: { start: number; end: number; url: string }[];
        if (links.length > 1) {
            contiguousLinks = [links[0]];
            let previousLink = links[0];
            for (let i = 1; i < links.length; i++) {
                if (links[i].url === previousLink.url && links[i].start === previousLink.end) {
                    previousLink.end = links[i].end;
                } else {
                    contiguousLinks.push(links[i]);
                    previousLink = links[i];
                }
            }
        } else {
            contiguousLinks = links;
        }
        // find the link that contains the cursor
        const maybeLink = contiguousLinks.find((link) => cursor.parentOffset > link.start && cursor.parentOffset <= link.end);
        if (maybeLink) {
            title = cursor.parent.textBetween(maybeLink.start, maybeLink.end);
            url = maybeLink.url;
            let parentPos: number | null = null;
            state.doc.content.forEach((node, pos) => {
                if (node === cursor.parent) {
                    parentPos = pos;
                }
            });
            if (parentPos !== null) {
                start = maybeLink.start + parentPos + 1;
                end = maybeLink.end + parentPos + 1;
            }
        }
    } else {
        const links: { start: number; end: number; url: string }[] = [];
        let contiguousLinks: { start: number; end: number; url: string }[] = [];
        for (const range of state.selection.ranges) {
            const { $from, $to } = range;
            const text = state.doc.textBetween($from.pos, $to.pos);
            title += text;
            state.doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
                if (node.isText) {
                    return;
                }
                node.content.forEach((textNode, innerPos) => {
                    if (textNode.isBlock) {
                        return;
                    }
                    const link = schema.marks.link.isInSet(textNode.marks || []) || null;
                    if (link) {
                        links.push({ start: pos + innerPos + 1, end: pos + innerPos + 1 + textNode.nodeSize, url: link.attrs.href });
                        return;
                    }
                });
            });
            // concatenate links that are contiguous
            if (links.length > 1) {
                contiguousLinks = [links[0]];
                let previousLink = links[0];
                for (let i = 1; i < links.length; i++) {
                    if (links[i].url === previousLink.url && links[i].start === previousLink.end) {
                        previousLink.end = links[i].end;
                    } else {
                        contiguousLinks.push(links[i]);
                        previousLink = links[i];
                    }
                }
            } else {
                contiguousLinks = links;
            }
        }
        const maybeLink =
            state.selection.ranges.length === 1
                ? contiguousLinks.find(
                      (link) =>
                          state.selection.ranges[0].$from.pos >= link.start &&
                          state.selection.ranges[0].$from.pos <= link.end &&
                          state.selection.ranges[0].$to.pos >= link.start &&
                          state.selection.ranges[0].$to.pos <= link.end,
                  )
                : null;
        if (maybeLink) {
            title = state.doc.textBetween(maybeLink.start, maybeLink.end);
            url = contiguousLinks[0].url;
            start = contiguousLinks[0].start;
            end = contiguousLinks[0].end;
        }
    }
    return {
        title,
        url,
        start,
        end,
    };
};

export const addLink = (state: EditorState, title: string, url: string, dispatch?: EditorView['dispatch']) => {
    if (!dispatch) {
        return;
    }
    const cursor = isTextSelection(state.selection) ? state.selection.$cursor : null;
    const { start, end } = getLinkAtSelection(state);
    if (start !== null && end !== null) {
        const tr = state.tr;
        tr.insertText(title, start, end);
        tr.addMark(start, start + title.length, schema.marks.link.create({ href: url }));
        dispatch(tr);
    } else if (cursor) {
        const tr = state.tr;
        tr.insertText(title);
        tr.addMark(cursor.pos, cursor.pos + title.length, schema.marks.link.create({ href: url }));
        dispatch(tr);
    } else {
        const tr = state.tr;
        for (let i = 0; i < state.selection.ranges.length; i++) {
            const { $from, $to } = state.selection.ranges[i];
            tr.insertText(title, $from.pos, $to.pos);
            tr.addMark($from.pos, $from.pos + title.length, schema.marks.link.create({ href: url }));
        }
        dispatch(tr);
    }
};

export const deleteLink = (state: EditorState, dispatch?: EditorView['dispatch']) => {
    if (!dispatch) {
        return;
    }
    const { start, end } = getLinkAtSelection(state);
    if (start !== null && end !== null) {
        const tr = state.tr;
        tr.removeMark(start, end, schema.marks.link);
        dispatch(tr);
    }
};

export const isSelectionLink = (state: EditorState) => {
    const cursorMarks = isTextSelection(state.selection) ? state.selection.$cursor?.marks() || [] : [];
    let isLink = schema.marks.link.isInSet(cursorMarks)?.attrs.href !== undefined;
    for (let i = 0; i < state.selection.ranges.length; i++) {
        const {
            $from: { pos: from },
            $to: { pos: to },
        } = state.selection.ranges[i];
        isLink = isLink || state.doc.rangeHasMark(from, to, schema.marks.link);
    }
    return isLink;
};
