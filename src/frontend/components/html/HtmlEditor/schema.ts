import { Schema } from 'prosemirror-model';

export const ALIGN_VALUES = new Set(['center', 'right', 'justify']);
const DEFAULT_ALIGN = 'left';

export const schema = new Schema({
    nodes: {
        doc: { content: 'block+' },
        paragraph: {
            group: 'block',
            content: 'inline*',
            attrs: {
                align: { default: 'left', validate: 'string' }, // improve
            },
            parseDOM: [
                {
                    tag: 'p',
                    getAttrs(dom: HTMLElement) {
                        return { align: dom.style.textAlign || DEFAULT_ALIGN };
                    },
                },
            ],
            toDOM: (node) =>
                ALIGN_VALUES.has(node.attrs.align)
                    ? [
                          'p',
                          {
                              style: node.attrs.align !== 'left' ? `text-align: ${node.attrs.align};` : undefined,
                          },
                          0,
                      ]
                    : ['p', 0],
        },
        heading: {
            group: 'block',
            content: 'inline*',
            attrs: { level: { default: 1, validate: 'number' }, align: { default: 'left', validate: 'string' } },
            defining: true,
            marks: '', // No marks allowed for heading
            parseDOM: [
                {
                    tag: 'h2',
                    getAttrs(dom: HTMLElement) {
                        return { level: 2, align: dom.style.textAlign || DEFAULT_ALIGN };
                    },
                },
                {
                    tag: 'h3',
                    getAttrs(dom: HTMLElement) {
                        return { level: 3, align: dom.style.textAlign || DEFAULT_ALIGN };
                    },
                },
            ],
            toDOM: (node) => [`h${node.attrs.level}`, { style: node.attrs.align !== 'left' ? `text-align: ${node.attrs.align};` : undefined }, 0],
        },
        text: {
            group: 'inline',
        },
    },
    marks: {
        bold: {
            parseDOM: [{ tag: 'strong' }],
            toDOM: () => ['strong', 0],
        },
        italic: {
            parseDOM: [{ tag: 'em' }],
            toDOM: () => ['em', 0],
        },
        underline: {
            parseDOM: [{ tag: 'u' }],
            toDOM: () => ['u', 0],
        },
        link: {
            attrs: {
                href: { validate: 'string' },
            },
            inclusive: false,
            parseDOM: [
                {
                    tag: 'a[href]',
                    getAttrs(dom: HTMLElement) {
                        return { href: dom.getAttribute('href') };
                    },
                },
            ],
            toDOM: (node) => ['a', { href: node.attrs.href, target: '_blank' }, 0],
        },
        color: {
            attrs: {
                color: { validate: 'string' },
            },
            parseDOM: [
                {
                    tag: 'span[style*="color"]',
                    getAttrs(dom: HTMLElement) {
                        return { color: dom.style.color };
                    },
                },
            ],
            toDOM: (node) => ['span', { style: `color: ${node.attrs.color};` }, 0],
        },
    },
});
