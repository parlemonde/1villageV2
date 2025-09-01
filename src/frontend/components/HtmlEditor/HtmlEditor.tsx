'use client';

import classNames from 'clsx';
import { baseKeymap } from 'prosemirror-commands';
import { keymap } from 'prosemirror-keymap';
import { Node } from 'prosemirror-model';
import { EditorState, Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import * as React from 'react';
import isEqual from 'react-fast-compare';

import styles from './html-editor.module.css';
import { schema } from './schema';

const defaultContent = {
    type: 'doc',
    content: [],
};

const getDoc = (content?: unknown): Node => {
    try {
        return Node.fromJSON(schema, content);
    } catch {
        return Node.fromJSON(schema, defaultContent);
    }
};

function placeholderPlugin(text: string) {
    return new Plugin({
        props: {
            decorations(state) {
                const doc = state.doc;
                if (
                    doc.childCount === 0 ||
                    (doc.childCount === 1 && doc.firstChild !== null && doc.firstChild.isTextblock && doc.firstChild.content.size == 0)
                ) {
                    const placeholderSpan = document.createElement('span');
                    placeholderSpan.classList.add(styles.placeholder);
                    placeholderSpan.textContent = text;
                    return DecorationSet.create(doc, [Decoration.widget(doc.childCount, placeholderSpan)]);
                }
            },
        },
    });
}

interface HtmlEditorProps {
    content?: unknown;
    color?: 'primary' | 'secondary';
    placeholder?: string;
    onChange?: (content: unknown) => void;
}

export const HtmlEditor = (props: HtmlEditorProps) => {
    const { content, onChange, color = 'primary', placeholder } = props;
    const parentDoc = getDoc(content);

    const [state, setState] = React.useState<EditorState>(
        EditorState.create({ doc: parentDoc, schema, plugins: [keymap(baseKeymap), placeholderPlugin(placeholder || '')] }),
    );
    const viewRef = React.useRef<EditorView | null>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Keep the state in sync with the content if the editor is controlled
    if ('content' in props && !parentDoc.eq(state.doc)) {
        const newState = EditorState.create({
            doc: parentDoc,
            schema,
            plugins: [keymap(baseKeymap), placeholderPlugin(placeholder || '')],
        });
        setState(newState);
        viewRef.current?.updateState(newState);
    }

    // Use a following ref to avoid re-initializing the editor when the content changes
    const contentRef = React.useRef(content);
    React.useEffect(() => {
        contentRef.current = content;
    }, [content]);

    // Use a following ref to avoid re-initializing the editor when the onChange callback changes
    const onChangeRef = React.useRef(onChange);
    React.useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    // Initialize the editor
    React.useEffect(() => {
        if (viewRef.current || !containerRef.current) {
            return;
        }
        const view = new EditorView(containerRef.current, {
            state,
            dispatchTransaction(transaction) {
                const newState = view.state.apply(transaction);
                view.updateState(newState);
                setState(newState);
                // Avoid re-rendering when the content is the same
                // Also use JSON.parse(JSON.stringify()) to avoid some reference issues
                const newContent = JSON.parse(JSON.stringify(newState.doc.toJSON()));
                if (!isEqual(newContent, contentRef.current)) {
                    onChangeRef.current?.(newContent);
                }
            },
        });
        viewRef.current = view;
    }, [state]);

    // On unmount destroy the editor
    React.useEffect(() => {
        return () => {
            viewRef.current?.destroy();
            viewRef.current = null;
        };
    }, []);

    return <div ref={containerRef} className={classNames(styles.htmlEditor, styles[`color-${color}`])}></div>;
};
