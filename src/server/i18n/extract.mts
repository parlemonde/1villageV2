// eslint-disable-next-line camelcase
import { unstable_extractMessages } from 'next-intl/extractor';

await unstable_extractMessages({
    srcPath: './src',
    sourceLocale: 'fr',
    messages: {
        path: './src/server/i18n/messages',
        format: 'json',
        locales: ['fr'],
    },
});

// eslint-disable-next-line no-console
console.log('✔ Messages extracted');
