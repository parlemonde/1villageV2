import type { DEFAULT_MESSAGES_TYPE } from './src/server/i18n/default-messages';

declare module 'next-intl' {
    interface AppConfig {
        Messages: DEFAULT_MESSAGES_TYPE;
    }
}
