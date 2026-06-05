import { db } from '@server/database';
import { languages } from '@server/database/schemas/languages';
import { eq } from 'drizzle-orm';

import { computeProgress } from './get-progress';
import { getDefaultMessages, isObject } from './request';

export interface TranslationMessage {
    key: string;
    original: string;
    traduction: string | null;
}

export interface TranslationGroup {
    path: string;
    messages: TranslationMessage[];
}

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
                processObject(origValue, isObject(transValue) ? transValue : {}, fullPath);
            } else if (typeof origValue === 'string') {
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

    const result: TranslationGroup[] = [];
    for (const [path, messages] of groups.entries()) {
        if (path || messages.length > 0) {
            result.push({
                path: path || 'root',
                messages,
            });
        }
    }

    return result.sort((a, b) => a.path.localeCompare(b.path));
}

export async function getGroupedMessages(locale: string): Promise<{ messages: TranslationGroup[]; progress: number }> {
    const original = await getDefaultMessages();

    const language = await db.query.languages.findFirst({
        columns: { locales: true },
        where: eq(languages.code, locale),
    });
    const translated = (language?.locales as Record<string, unknown> | undefined) ?? {};
    return {
        messages: transformToGroupedFormat(original, translated),
        progress: locale === 'fr' ? 100 : computeProgress(original, translated),
    };
}
