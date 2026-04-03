// lib/prosemirror-to-html.ts
import type { HtmlEditorContent } from '@frontend/components/html/HtmlEditor/HtmlEditor';
import type { Node, Mark } from 'prosemirror-model';

import { schema } from './html-schema';

function escapeHTML(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function serializeMarks(marks: readonly Mark[], content: string): string {
    return marks.reduceRight((inner, mark) => {
        switch (mark.type.name) {
            case 'bold':
                return `<strong>${inner}</strong>`;
            case 'italic':
                return `<em>${inner}</em>`;
            case 'underline':
                return `<u>${inner}</u>`;
            case 'link':
                return `<a href="${escapeHTML(mark.attrs.href)}" target="_blank">${inner}</a>`;
            case 'color':
                return `<span style="color: ${escapeHTML(mark.attrs.color)};">${inner}</span>`;
            default:
                return inner;
        }
    }, content);
}

function serializeNode(node: Node): string {
    if (node.isText) {
        const escaped = escapeHTML(node.text ?? '');
        return serializeMarks(node.marks, escaped);
    }

    const children = (): string => {
        let html = '';
        node.forEach((child) => {
            html += serializeNode(child);
        });
        return html || '<br>';
    };

    switch (node.type.name) {
        case 'doc':
            return children();

        case 'paragraph': {
            const align = node.attrs.align;
            const style = align && align !== 'left' ? ` style="text-align: ${align};"` : '';
            return `<p${style}>${children()}</p>`;
        }

        case 'heading': {
            const { level, align } = node.attrs;
            const style = align && align !== 'left' ? ` style="text-align: ${align};"` : '';
            return `<h${level}${style}>${children()}</h${level}>`;
        }

        default:
            return children();
    }
}

export function prosemirrorToHTML(json: HtmlEditorContent): string {
    const doc = schema.nodeFromJSON(json);
    return serializeNode(doc);
}
