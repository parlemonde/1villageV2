import { db } from '@server/database';
import { languages } from '@server/database/schemas/languages';
import { eq } from 'drizzle-orm';

import { isObject } from './request';
import { getDefaultMessages } from './server';

export function computeProgress(original: Record<string, unknown>, translated: Record<string, unknown>): number {
    let totalCount = 0;
    let translatedCount = 0;
    function processObject(origObj: Record<string, unknown>, transObj: Record<string, unknown>) {
        for (const key of Object.keys(origObj)) {
            const origValue = origObj[key];
            const transValue = transObj[key];

            if (isObject(origValue)) {
                processObject(origValue, isObject(transValue) ? transValue : {});
            } else if (typeof origValue === 'string') {
                totalCount += 1;
                if (typeof transValue === 'string') {
                    translatedCount += 1;
                }
            }
        }
    }
    processObject(original, translated);
    return (translatedCount / totalCount) * 100;
}

async function getProgress(locale: string) {
    const original = await getDefaultMessages();
    if (locale === 'fr') return 100;

    const language = await db.query.languages.findFirst({
        columns: { locales: true },
        where: eq(languages.code, locale),
    });
    const messages = (language?.locales as Record<string, unknown> | undefined) ?? {};
    return computeProgress(original, messages);
}
export async function getAllProgress(locales: string[]) {
    return Object.fromEntries((await Promise.all(locales.map(getProgress))).map((p, index) => [locales[index], p]));
}
