import { isObject, fetchMessages, getDefaultMessages } from './request';

export function computeProgress(original: Record<string, unknown>, translated: Record<string, unknown>): number {
    let totalCount = 0;
    let translatedCount = 0;
    function processObject(origObj: Record<string, unknown>, transObj: Record<string, unknown>) {
        for (const key of Object.keys(origObj)) {
            const origValue = origObj[key];
            const transValue = transObj[key];

            if (isObject(origValue)) {
                // Recursively process nested objects
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
    const messages = await fetchMessages(locale, locale !== 'fr');
    return computeProgress(original, messages);
}
export async function getAllProgress(locales: string[]) {
    return Object.fromEntries((await Promise.all(locales.map(getProgress))).map((p, index) => [locales[index], p]));
}
