import { getDynamoDBItem } from '@server/aws/dynamodb';
import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

import extractedMessages from './messages/en.json';

const isObject = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null;
};

const DEFAULT_MESSAGES = isObject(extractedMessages) ? extractedMessages : {};

const combineMessagesWithDefault = (
    messages: Record<string, unknown>,
    defaults: Record<string, unknown> = DEFAULT_MESSAGES,
): Record<string, unknown> => {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(defaults)) {
        const defaultValue = defaults[key];
        const messageValue = messages[key];
        if (isObject(defaultValue)) {
            result[key] = combineMessagesWithDefault(isObject(messageValue) ? messageValue : {}, defaultValue);
        } else {
            result[key] = key in messages ? messageValue : defaultValue;
        }
    }
    return result;
};

const fetchMessages = async (locale: string) => {
    try {
        const messages = await getDynamoDBItem<string>(`locale-${locale}.json`);
        return messages ? combineMessagesWithDefault(JSON.parse(messages)) : DEFAULT_MESSAGES;
    } catch {
        return DEFAULT_MESSAGES;
    }
};

export default getRequestConfig(async () => {
    const store = await cookies();
    const locale = store.get('locale')?.value || 'en';
    const messages = await fetchMessages(locale);

    return {
        locale,
        messages,
    };
});
