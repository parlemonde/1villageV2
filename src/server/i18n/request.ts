import { getRequestConfig } from 'next-intl/server';

import { getLocalesForLanguage, getRequestLocale } from './server';

export const isObject = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null;
};

export const getDefaultMessages = async () => {
    return (await import(`./messages/fr.json`)).default;
};

export default getRequestConfig(async () => {
    const currentLocale = await getRequestLocale();

    return {
        locale: currentLocale,
        messages: await getLocalesForLanguage(currentLocale),
    };
});
