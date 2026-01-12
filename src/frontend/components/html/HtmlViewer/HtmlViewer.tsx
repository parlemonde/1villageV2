'use client';

import { ALIGN_VALUES, schema } from '@frontend/components/html/HtmlEditor/schema';
import { Node, Schema } from 'prosemirror-model';
import { DOMSerializer } from 'prosemirror-model';
import { useSyncExternalStore } from 'react';

import styles from './html-viewer.module.css';

// Use a custom view schema to override the default behavior of the paragraph node to DOM
const viewSchema = new Schema({
    nodes: {
        ...schema.spec.nodes.toObject(),
        paragraph: {
            ...schema.spec.nodes.get('paragraph'),
            toDOM(node) {
                const alignStyle = ALIGN_VALUES.has(node.attrs.align)
                    ? {
                          style: node.attrs.align !== 'left' ? `text-align: ${node.attrs.align};` : undefined,
                      }
                    : {};
                if (!node.content.size) {
                    return ['p', alignStyle, ['br']];
                }
                return ['p', alignStyle, 0];
            },
        },
    },
    marks: schema.spec.marks,
});
const serializer = DOMSerializer.fromSchema(viewSchema);

const toHtml = (content: unknown) => {
    try {
        const doc = Node.fromJSON(schema, content);
        const element = serializer.serializeFragment(doc.content);
        const divElement = document.createElement('div');
        divElement.appendChild(element);
        return divElement.innerHTML;
    } catch {
        // ignore
        return null;
    }
};

interface HtmlViewerProps {
    content: unknown;
}
export const HtmlViewer = ({ content }: HtmlViewerProps) => {
    // Use an external store sync to avoid hydration mismatch with the server
    const html = useSyncExternalStore(
        () => () => {},
        () => toHtml(content),
        () => null,
    );
    if (!html) {
        return null;
    }
    return <div className={styles.htmlViewer} dangerouslySetInnerHTML={{ __html: html }} />;
};

const isHTMLElement = (el: Element): el is HTMLElement => 'innerText' in el;
function addDotToElement(element: HTMLElement): void {
    const innerText = element.innerText || '';
    if (innerText.length > 0 && !/\W/im.test(innerText.slice(-1))) {
        element.innerText = `${innerText}. `;
    }
}
const toText = (content: unknown) => {
    try {
        const doc = Node.fromJSON(schema, content);
        const element = serializer.serializeFragment(doc.content);
        const divElement = document.createElement('div');
        divElement.appendChild(element);
        [...divElement.children].filter(isHTMLElement).forEach(addDotToElement);
        return divElement.textContent || divElement.innerText || '';
    } catch {
        // ignore
        return null;
    }
};
export const HtmlViewerText = ({ content }: HtmlViewerProps) => {
    const text = useSyncExternalStore(
        () => () => {},
        () => toText(content),
        () => null,
    );
    if (!text) {
        return null;
    }
    return text;
};
