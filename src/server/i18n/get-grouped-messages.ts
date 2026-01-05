import { computeProgress } from './get-progress';
import { getDefaultMessages, fetchMessages, isObject } from './request';

export interface TranslationMessage {
    key: string;
    original: string;
    traduction: string | null;
}

export interface TranslationGroup {
    path: string;
    messages: TranslationMessage[];
}

/**
 * Transforms nested JSON translation objects into a grouped format
 * Groups messages by their parent path, excluding the last key segment
 */
function transformToGroupedFormat(
    original: Record<string, unknown>,
    translated: Record<string, unknown>,
    parentPath: string[] = [],
): TranslationGroup[] {
    const groups: Map<string, TranslationMessage[]> = new Map();

    function processObject(origObj: Record<string, unknown>, transObj: Record<string, unknown>, currentPath: string[] = []): void {
        for (const key of Object.keys(origObj)) {
            const origValue = origObj[key];
            const transValue = transObj[key];
            const fullPath = [...currentPath, key];

            if (isObject(origValue)) {
                // Recursively process nested objects
                processObject(origValue, isObject(transValue) ? transValue : {}, fullPath);
            } else if (typeof origValue === 'string') {
                // This is a leaf node - create a message entry
                // Group path is everything except the last segment (the message key)
                const groupPath = currentPath.join('.');

                if (!groups.has(groupPath)) {
                    groups.set(groupPath, []);
                }

                groups.get(groupPath)!.push({
                    key: key,
                    original: origValue,
                    traduction: typeof transValue === 'string' ? transValue : null,
                });
            }
        }
    }

    processObject(original, translated, parentPath);

    // Convert the Map to an array of TranslationGroup objects
    const result: TranslationGroup[] = [];
    for (const [path, messages] of groups.entries()) {
        // Skip empty paths (root level)
        if (path || messages.length > 0) {
            result.push({
                path: path || 'root',
                messages,
            });
        }
    }

    // Sort by path for consistent output
    return result.sort((a, b) => a.path.localeCompare(b.path));
}

export async function getGroupedMessages(locale: string): Promise<{ messages: TranslationGroup[]; progress: number }> {
    const original = await getDefaultMessages();
    const messages = await fetchMessages(locale, locale !== 'fr');
    return { messages: transformToGroupedFormat(original, messages), progress: computeProgress(original, messages) };
}
