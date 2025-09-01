import { Schema } from 'prosemirror-model';

const ALIGN_VALUES = new Set(['center', 'right', 'justify']);
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
                              style: `text-align: ${node.attrs.align};`,
                          },
                          0,
                      ]
                    : ['p', 0],
        },
        heading: {
            group: 'block',
            content: 'inline*',
            attrs: { level: { default: 1, validate: 'number' } },
            defining: true,
            parseDOM: [
                { tag: 'h1', attrs: { level: 1 } },
                { tag: 'h2', attrs: { level: 2 } },
                { tag: 'h3', attrs: { level: 3 } },
                { tag: 'h4', attrs: { level: 4 } },
                { tag: 'h5', attrs: { level: 5 } },
                { tag: 'h6', attrs: { level: 6 } },
            ],
            toDOM: (node) => [`h${node.attrs.level}`, 0],
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
            toDOM: (node) => ['a', { href: node.attrs.href }, 0],
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
