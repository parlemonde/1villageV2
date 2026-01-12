import { getDynamoDBItem } from '@server/aws/dynamodb';
import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

export const isObject = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null;
};

const combineMessagesWithDefault = (
    messages: Record<string, unknown>,
    defaults: Record<string, unknown>,
    defaultToNull = false,
): Record<string, unknown> => {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(defaults)) {
        const defaultValue = defaults[key];
        const messageValue = messages[key];
        if (isObject(defaultValue)) {
            result[key] = combineMessagesWithDefault(isObject(messageValue) ? messageValue : {}, defaultValue, defaultToNull);
        } else {
            result[key] = key in messages ? messageValue : defaultToNull ? null : defaultValue;
        }
    }
    return result;
};

export const getDefaultMessages = async () => {
    return (await import(`./messages/en.json`)).default;
};

export const fetchMessages = async (locale: string, defaultToNull?: boolean) => {
    const defaultMessages = await getDefaultMessages();
    let messages: unknown = {};
    try {
        const result = await getDynamoDBItem<string>(`locale-${locale}.json`);
        if (result) {
            messages = JSON.parse(result);
        }
    } catch {
        // Ignore
    }
    return combineMessagesWithDefault(isObject(messages) ? messages : {}, defaultMessages, defaultToNull);
};

export default getRequestConfig(async () => {
    const store = await cookies();
    const locale = store.get('locale')?.value || 'fr';
    const messages = await fetchMessages(locale);

    return {
        locale,
        messages,
    };
});
