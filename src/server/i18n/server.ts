import { db } from '@server/database';
import { languages } from '@server/database/schemas/languages';
import { logger } from '@server/lib/logger';
import { eq } from 'drizzle-orm';
import { cacheLife, revalidateTag, cacheTag } from 'next/cache';
import { cookies } from 'next/headers';
import type { AbstractIntlMessages } from 'next-intl';

const LOCALE_COOKIE_NAME = 'locale';
const DEFAULT_LOCALE = 'fr';

export async function getDefaultMessages(): Promise<AbstractIntlMessages> {
    return (await import(`./messages/fr.json`)).default as AbstractIntlMessages;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeMessages(baseMessages: AbstractIntlMessages, overrideMessages: AbstractIntlMessages): AbstractIntlMessages {
    const mergedMessages: AbstractIntlMessages = { ...baseMessages };

    for (const [key, value] of Object.entries(overrideMessages)) {
        const currentValue = mergedMessages[key];
        if (isPlainObject(value) && isPlainObject(currentValue)) {
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
