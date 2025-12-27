export const DEFAULT_MESSAGES = {
    HomePage: {
        title: 'Hello {firstName}',
    },
} as const;

export type DEFAULT_MESSAGES_TYPE = typeof DEFAULT_MESSAGES;
