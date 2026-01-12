import { schema } from '@frontend/components/html/HtmlEditor/schema';
import { setBlockType as setBlockTypeCommand } from 'prosemirror-commands';
import type { Node } from 'prosemirror-model';
import type { EditorState } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';

const pCommand = setBlockTypeCommand(schema.nodes.paragraph, {});
const h2Command = setBlockTypeCommand(schema.nodes.heading, { level: 2 });
const h3Command = setBlockTypeCommand(schema.nodes.heading, { level: 3 });

type NodeType = 'paragraph' | 'h2' | 'h3';
const toNodeType = (node: Node): NodeType | null => {
    if (node.type.name === 'heading') {
        return node.attrs.level === 2 ? 'h2' : node.attrs.level === 3 ? 'h3' : null;
    }
    return node.type.name === 'paragraph' ? 'paragraph' : null;
};

export const setBlockType = (state: EditorState, type: string, dispatch?: EditorView['dispatch']) => {
    if (type === '' || type === 'paragraph') {
        pCommand(state, dispatch);
    } else if (type === 'h2') {
        h2Command(state, dispatch);
    } else if (type === 'h3') {
        h3Command(state, dispatch);
    }
};

export const getBlockType = (nodes: Node[]): string => {
    const nodeTypes = new Set(nodes.filter((n) => n.isBlock).map(toNodeType));
    return nodeTypes.size === 1 ? Array.from(nodeTypes)[0] || '' : '';
};
