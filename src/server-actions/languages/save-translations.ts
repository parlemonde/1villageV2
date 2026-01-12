'use server';

import { setDynamoDBItem } from '@server/aws/dynamodb';
import type { TranslationGroup } from '@server/i18n/get-grouped-messages';
import { getDefaultMessages, isObject } from '@server/i18n/request';
import { revalidatePath } from 'next/cache';

/**
 * Transforms grouped translation format back to nested JSON structure
 * Only includes translations that are different from null
 */
function transformGroupedToJson(groups: TranslationGroup[]): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const group of groups) {
        // Parse the path to create nested structure
        const pathParts = group.path ? group.path.split('.') : [];

        for (const message of group.messages) {
            // Only include translations that have been set (not null)
            if (message.traduction !== null && message.traduction !== '') {
                // Build the full path including the message key
                const fullPath = [...pathParts, message.key];

                // Create nested structure
                let current: Record<string, unknown> = result;
                for (let i = 0; i < fullPath.length - 1; i++) {
                    const part = fullPath[i];
                    if (!isObject(current[part])) {
                        current[part] = {};
                    }
                    current = current[part] as Record<string, unknown>;
                }

                // Set the translation value at the final key
                current[fullPath[fullPath.length - 1]] = message.traduction;
            }
        }
    }

    return result;
}

/**
 * Removes keys that match the default messages (to save space in DynamoDB)
 */
async function removeDefaultValues(translations: Record<string, unknown>, defaults: Record<string, unknown>): Promise<Record<string, unknown>> {
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(translations)) {
        const translationValue = translations[key];
        const defaultValue = defaults[key];

        if (isObject(translationValue) && isObject(defaultValue)) {
            // Recursively process nested objects
            const cleanedNested = await removeDefaultValues(translationValue, defaultValue);
            if (Object.keys(cleanedNested).length > 0) {
                result[key] = cleanedNested;
            }
        } else if (translationValue !== defaultValue) {
            // Only include if different from default
            result[key] = translationValue;
        }
    }

    return result;
}

export async function saveTranslations(languageCode: string, translationGroups: TranslationGroup[]): Promise<void> {
    try {
        // Transform grouped format back to nested JSON
        const jsonTranslations = transformGroupedToJson(translationGroups);

        // Get default messages to compare
        const defaultMessages = await getDefaultMessages();

        // Remove values that are the same as defaults
        const cleanedTranslations = await removeDefaultValues(jsonTranslations, defaultMessages);

        // Save to DynamoDB using the expected key format
        const dynamoKey = `locale-${languageCode}.json`;

        // If there are no translations different from defaults, we can delete the item
        if (Object.keys(cleanedTranslations).length === 0) {
            await setDynamoDBItem(dynamoKey, undefined);
        } else {
            // Save the JSON string to DynamoDB
            await setDynamoDBItem(dynamoKey, JSON.stringify(cleanedTranslations));
        }
    } catch (error) {
        console.error('Failed to save translations:', error);
    }
    revalidatePath(`/admin/manage/translations/${languageCode}`);
}
