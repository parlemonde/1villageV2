import eslintJS from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintNextVitals from 'eslint-config-next/core-web-vitals';
import eslintPrettier from 'eslint-plugin-prettier/recommended';
import eslintTS from 'typescript-eslint';

import i18nNamespacePlugin from './eslint-plugins/i18n-namespace.mjs';

const eslintConfig = defineConfig([
    ...eslintNextVitals,
    eslintJS.configs.recommended,
    eslintTS.configs.recommended,
    eslintPrettier,
    {
        plugins: {
            'i18n-namespace': i18nNamespacePlugin,
        },
        rules: {
            // Validate namespace for useExtracted/getExtracted
            'i18n-namespace/valid-namespace': 'error',
            // Disallow useTranslations from next-intl, use useExtracted instead
            'no-restricted-imports': [
                'error',
                {
                    paths: [
                        {
                            name: 'next-intl',
                            importNames: ['useTranslations'],
                            message: 'Use useExtracted from next-intl instead of useTranslations.',
                        },
                        {
                            name: 'next-intl/server',
                            importNames: ['getTranslations'],
                            message: 'Use getExtracted from next-intl instead of getTranslations.',
                        },
                    ],
                },
            ],
            // Windows eol
            'prettier/prettier': [
                'error',
                {
                    endOfLine: 'auto',
                },
            ],
            'no-console': [
                'error',
                {
                    allow: ['warn', 'error'],
                },
            ],
            camelcase: [
                'error',
                {
                    properties: 'always',
                },
            ],
            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports',
                    disallowTypeAnnotations: false,
                },
            ],
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-inferrable-types': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/require-await': 'off',
            '@typescript-eslint/unbound-method': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unused-expressions': [
                'error',
                {
                    allowShortCircuit: true,
                    allowTernary: true,
                },
            ],
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    args: 'all',
                    argsIgnorePattern: '^_',
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                },
            ],
            'import/newline-after-import': [
                'error',
                {
                    count: 1,
                },
            ],
            'import/order': [
                'error',
                {
                    groups: [
                        ['builtin', 'external', 'internal'],
                        ['parent', 'sibling', 'index'],
                    ],
                    'newlines-between': 'always',
                    alphabetize: {
                        order: 'asc',
                        caseInsensitive: false,
                    },
                },
            ],
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            '@typescript-eslint/triple-slash-reference': 'off',
        },
    },
    globalIgnores(['public', '.postgres-data/', '.next/', '.open-next/', 'drizzle/', 'node_modules/', 'tmp/', 'server-transcode-videos/']),
]);

export default eslintConfig;
