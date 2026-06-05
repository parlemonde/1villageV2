import { db } from '@server/database';
import { languages } from '@server/database/schemas/languages';
import { logger } from '@server/lib/logger';
import { eq } from 'drizzle-orm';
import { cacheLife, revalidateTag, cacheTag } from 'next/cache';
import { cookies } from 'next/headers';
import type { AbstractIntlMessages } from 'next-intl';

const LOCALE_COOKIE_NAME = 'locale';
const DEFAULT_LOCALE = 'fr';

function mergeMessages(baseMessages: AbstractIntlMessages, overrideMessages: AbstractIntlMessages): AbstractIntlMessages {
    const mergedMessages: AbstractIntlMessages = { ...baseMessages };

    for (const [key, value] of Object.entries(overrideMessages)) {
        const currentValue = mergedMessages[key];
        if (
            value !== null &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            currentValue !== null &&
            typeof currentValue === 'object' &&
            !Array.isArray(currentValue)
        ) {
            mergedMessages[key] = mergeMessages(currentValue, value);
        } else {
            mergedMessages[key] = value;
        }
    }

    return mergedMessages;
}

export function getLocalesCacheTag(languageCode: string): string {
    return `locales:${languageCode}`;
}

export function revalidateLocalesCacheTag(languageCode: string): void {
    revalidateTag(getLocalesCacheTag(languageCode), 'max');
}

async function getDefaultMessages(): Promise<AbstractIntlMessages> {
    return (await import(`./messages/fr.json`)).default as AbstractIntlMessages;
}

export async function getLocalesForLanguage(languageCode: string) {
    'use cache';

    cacheLife('hours');
    cacheTag(getLocalesCacheTag(languageCode));

    let locales = await getDefaultMessages();

    try {
        const language = await db.query.languages.findFirst({
            columns: {
                locales: true,
            },
            where: eq(languages.code, languageCode),
        });
        if (language?.locales) {
            locales = mergeMessages(locales, language.locales);
        }
    } catch (err) {
        logger.error(err);
    }

    return locales;
}

export async function getRequestLocale(): Promise<string> {
    const cookieStore = await cookies();
    return cookieStore.get(LOCALE_COOKIE_NAME)?.value || DEFAULT_LOCALE;
}
