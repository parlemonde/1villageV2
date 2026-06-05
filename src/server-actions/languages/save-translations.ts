'use server';

import { db } from '@server/database';
import { languages } from '@server/database/schemas/languages';
import type { TranslationGroup } from '@server/i18n/get-grouped-messages';
import { getDefaultMessages, isObject } from '@server/i18n/request';
import { revalidateLocalesCacheTag } from '@server/i18n/server';
import { logger } from '@server/lib/logger';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { AbstractIntlMessages } from 'next-intl';

function transformGroupedToJson(groups: TranslationGroup[]): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const group of groups) {
        const pathParts = group.path ? group.path.split('.') : [];

        for (const message of group.messages) {
            if (message.traduction !== null && message.traduction !== '') {
                const fullPath = [...pathParts, message.key];

                let current: Record<string, unknown> = result;
                for (let i = 0; i < fullPath.length - 1; i++) {
                    const part = fullPath[i];
                    if (!isObject(current[part])) {
                        current[part] = {};
                    }
                    current = current[part] as Record<string, unknown>;
                }

                current[fullPath[fullPath.length - 1]] = message.traduction;
            }
        }
    }

    return result;
}

/**
 * Removes keys that match the default messages so they don't become frozen overrides.
 */
async function removeDefaultValues(translations: Record<string, unknown>, defaults: Record<string, unknown>): Promise<Record<string, unknown>> {
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(translations)) {
        const translationValue = translations[key];
        const defaultValue = defaults[key];

        if (isObject(translationValue) && isObject(defaultValue)) {
            const cleanedNested = await removeDefaultValues(translationValue, defaultValue);
            if (Object.keys(cleanedNested).length > 0) {
                result[key] = cleanedNested;
            }
        } else if (translationValue !== defaultValue) {
            result[key] = translationValue;
        }
    }

    return result;
}

export async function saveTranslations(languageCode: string, translationGroups: TranslationGroup[]): Promise<void> {
    try {
        const jsonTranslations = transformGroupedToJson(translationGroups);
        const defaultMessages = await getDefaultMessages();
        const cleanedTranslations = await removeDefaultValues(jsonTranslations, defaultMessages);

        if (Object.keys(cleanedTranslations).length === 0) {
            await db.update(languages).set({ locales: null }).where(eq(languages.code, languageCode));
        } else {
            await db
                .update(languages)
                .set({ locales: cleanedTranslations as AbstractIntlMessages })
                .where(eq(languages.code, languageCode));
        }

        revalidateLocalesCacheTag(languageCode);
        revalidatePath(`/admin/manage/translations/${languageCode}`);
    } catch (error) {
        logger.error('Failed to save translations:', { error });
        throw error;
    }
}
