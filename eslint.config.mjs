import eslintCSS from '@eslint/css';
import eslintJS from '@eslint/js';
import eslintJson from '@eslint/json';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintNextVitals from 'eslint-config-next/core-web-vitals';
import eslintPrettier from 'eslint-plugin-prettier/recommended';
import eslintTS from 'typescript-eslint';

import i18nNamespacePlugin from './eslint-plugins/i18n-namespace.mjs';
import importBoundariesPlugin from './eslint-plugins/import-boundaries.mjs';

const eslintConfig = defineConfig([
    eslintNextVitals.map((c) => ({
        files: ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'],
        ...c,
    })),
    {
        files: ['**/*.{js,jsx,mjs}'],
        ...eslintJS.configs.recommended,
    },
    eslintTS.configs.recommended.map((c) => ({
        files: ['**/*.{ts,tsx,mts,cts}'],
        ...c,
    })),
    {
        name: 'css',
        files: ['**/*.css'],
        language: 'css/css',
        plugins: {
            css: eslintCSS,
        },
    },
    {
        files: ['**/*.json'],
        language: 'json/json',
        plugins: {
            json: eslintJson,
        },
        rules: {
            'json/no-duplicate-keys': 'error',
        },
    },
    {
        files: ['**/*.{json,css,js,jsx,mjs,ts,tsx,mts,cts}'],
        ...eslintPrettier,
    },
    {
        files: ['**/*.{json,css,js,jsx,mjs,ts,tsx,mts,cts}'],
        rules: {
            // Windows eol
            'prettier/prettier': [
                'error',
                {
                    endOfLine: 'auto',
                },
            ],
        },
    },
    {
        files: ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'],
        plugins: {
            'i18n-namespace': i18nNamespacePlugin,
            'import-boundaries': importBoundariesPlugin,
        },
        rules: {
            // Validate namespace for useExtracted/getExtracted
            'i18n-namespace/valid-namespace': 'error',
            // Import boundary rules
            'import-boundaries/frontend-restricted-imports': 'error',
            'import-boundaries/lib-restricted-imports': 'error',
            'import-boundaries/server-restricted-imports': 'error',
            'import-boundaries/server-actions-restricted-imports': 'error',
            'import-boundaries/enforce-import-aliases': 'error',
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
        },
    },
    {
        files: ['**/*.{ts,tsx,mts,cts}'],
        rules: {
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
            '@typescript-eslint/triple-slash-reference': 'off',
        },
    },
    globalIgnores([
        '.claude/*',
        '.cursor/*',
        '.github/*',
        '.vscode/*',
        '.zed/*',
        'drizzle/*',
        'node_modules/*',
        'public/*',
        'server-transcode-videos/*',
        '.postgres-data/*',
        '.next/*',
        '.open-next/*',
        'tmp/*',
        'next-env.d.ts',
        'src/server/i18n/messages/*',
    ]),
]);

export default eslintConfig;
