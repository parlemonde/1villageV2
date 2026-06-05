import { schema } from '@lib/html-schema';
import { Node } from 'prosemirror-model';

/**
 * Extract plain text from ProseMirror JSON content
 * Used for email previews and summaries
 */
export function extractTextFromProseMirror(content: unknown, maxLength = 150): string {
    try {
        const doc = Node.fromJSON(schema, content);
        let text = '';

        const collectText = (node: Node) => {
            if (node.isText && node.text) {
                text += node.text;
            }
            node.forEach((child) => {
                if (text.length < maxLength) {
                    collectText(child);
                }
            });
        };

        collectText(doc);

        // Truncate if too long and add ellipsis
        if (text.length > maxLength) {
            text = text.substring(0, maxLength) + '...';
        }

        return text.trim();
    } catch {
        return '';
    }
}
