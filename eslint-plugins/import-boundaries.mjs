import * as path from 'path';

/**
 * ESLint plugin to enforce import boundaries between frontend and server code.
 *
 * Rule 1: Files in src/frontend can only import types from @server/* modules
 * Rule 2: Files in src/server can only import types from @frontend/* modules
 * Rule 3: Files in src/frontend, src/server, and src/server-actions can only import types from @app/* modules
 */

/**
 * Checks if an import is a type-only import
 */
function isTypeOnlyImport(node) {
    // For ImportDeclaration nodes
    if (node.type === 'ImportDeclaration') {
        return node.importKind === 'type';
    }

    // For dynamic imports or require statements
    return false;
}

/**
 * Checks if the import has only type specifiers
 */
function hasOnlyTypeSpecifiers(node) {
    if (node.type !== 'ImportDeclaration' || !node.specifiers) {
        return false;
    }

    return node.specifiers.every((specifier) => {
        // ImportSpecifier with importKind === 'type'
        if (specifier.type === 'ImportSpecifier' && specifier.importKind === 'type') {
            return true;
        }
        // ImportDefaultSpecifier or ImportNamespaceSpecifier cannot be type-only individually
        // They are only type imports if the whole import is type-only
        return false;
    });
}

/**
 * Normalizes file paths to handle different OS path separators
 */
function normalizePath(filePath) {
    return filePath.replace(/\\/g, '/');
}

/** @type {import('eslint').ESLint.Plugin} */
const plugin = {
    meta: {
        name: 'eslint-plugin-import-boundaries',
        version: '1.0.0',
    },
    rules: {
        'frontend-restricted-imports': {
            meta: {
                type: 'problem',
                docs: {
                    description: 'Files in src/frontend can only import types from @app/* and @server/* modules',
                },
                messages: {
                    nonTypeImport:
                        'Files in src/frontend can only import types from @app/* and @server/* modules. Use "import type" or individual type imports.',
                },
                schema: [],
            },
            create(context) {
                const filename = normalizePath(context.filename || context.getFilename());
                if (!filename.includes('/src/frontend/')) {
                    return {};
                }
                return {
                    ImportDeclaration(node) {
                        const importPath = node.source.value;
                        const isRestrictedImport = importPath.startsWith('@app/') || importPath.startsWith('@server/');
                        if (typeof importPath === 'string' && isRestrictedImport) {
                            const isFullTypeImport = isTypeOnlyImport(node);
                            const hasOnlyTypes = hasOnlyTypeSpecifiers(node);
                            if (!isFullTypeImport && !hasOnlyTypes) {
                                context.report({
                                    node,
                                    messageId: 'nonTypeImport',
                                });
                            }
                        }
                    },
                };
            },
        },
        'server-restricted-imports': {
            meta: {
                type: 'problem',
                docs: {
                    description: 'Files in src/server can only import types from @app/*, @frontend/* and @server-actions/* modules',
                },
                messages: {
                    nonTypeImport:
                        'Files in src/server can only import types from @app/*, @frontend/* and @server-actions/* modules. Use "import type" or individual type imports.',
                },
                schema: [],
            },
            create(context) {
                const filename = normalizePath(context.filename || context.getFilename());
                if (!filename.includes('/src/server/')) {
                    return {};
                }
                return {
                    ImportDeclaration(node) {
                        const importPath = node.source.value;
                        const isRestrictedImport =
                            importPath.startsWith('@app/') || importPath.startsWith('@frontend/') || importPath.startsWith('@server-actions/');
                        if (typeof importPath === 'string' && isRestrictedImport) {
                            const isFullTypeImport = isTypeOnlyImport(node);
                            const hasOnlyTypes = hasOnlyTypeSpecifiers(node);
                            if (!isFullTypeImport && !hasOnlyTypes) {
                                context.report({
                                    node,
                                    messageId: 'nonTypeImport',
                                });
                            }
                        }
                    },
                };
            },
        },
        'server-actions-restricted-imports': {
            meta: {
                type: 'problem',
                docs: {
                    description: 'Files in src/server-actions can only import types from @app/* and @frontend/* modules',
                },
                messages: {
                    nonTypeImport:
                        'Files in src/server-actions can only import types from @app/* and @frontend/* modules. Use "import type" or individual type imports.',
                },
            },
            create(context) {
                const filename = normalizePath(context.filename || context.getFilename());
                if (!filename.includes('/src/server-actions/')) {
                    return {};
                }
                return {
                    ImportDeclaration(node) {
                        const importPath = node.source.value;
                        const isRestrictedImport = importPath.startsWith('@app/') || importPath.startsWith('@frontend/');
                        if (typeof importPath === 'string' && isRestrictedImport) {
                            const isFullTypeImport = isTypeOnlyImport(node);
                            const hasOnlyTypes = hasOnlyTypeSpecifiers(node);
                            if (!isFullTypeImport && !hasOnlyTypes) {
                                context.report({
                                    node,
                                    messageId: 'nonTypeImport',
                                });
                            }
                        }
                    },
                };
            },
        },
        'lib-restricted-imports': {
            meta: {
                type: 'problem',
                docs: {
                    description: 'Files in src/lib can only import types from @app/*, @frontend/*, @server/* and @server-actions/* modules',
                },
                messages: {
                    nonTypeImport:
                        'Files in src/lib can only import types from @app/*, @frontend/*, @server/* and @server-actions/* modules. Use "import type" or individual type imports.',
                },
                schema: [],
            },
            create(context) {
                const filename = normalizePath(context.filename || context.getFilename());
                if (!filename.includes('/src/lib/')) {
                    return {};
                }
                return {
                    ImportDeclaration(node) {
                        const importPath = node.source.value;
                        const isRestrictedImport =
                            importPath.startsWith('@app/') ||
                            importPath.startsWith('@frontend/') ||
                            importPath.startsWith('@server/') ||
                            importPath.startsWith('@server-actions/');
                        if (typeof importPath === 'string' && isRestrictedImport) {
                            const isFullTypeImport = isTypeOnlyImport(node);
                            const hasOnlyTypes = hasOnlyTypeSpecifiers(node);
                            if (!isFullTypeImport && !hasOnlyTypes) {
                                context.report({
                                    node,
                                    messageId: 'nonTypeImport',
                                });
                            }
                        }
                    },
                };
            },
        },
        'enforce-import-aliases': {
            meta: {
                type: 'problem',
                docs: {
                    description: 'Enforce using import aliases instead of relative paths for cross-module imports',
                },
                messages: {
                    useAlias: 'Use import alias "{{alias}}" instead of relative path',
                },
                fixable: 'code',
                schema: [],
            },
            create(context) {
                const filename = normalizePath(context.filename || context.getFilename());

                // Extract the current file's location in src
                const srcMatch = filename.match(/\/src\/(.+)/);
                if (!srcMatch) {
                    return {};
                }

                const currentFilePath = srcMatch[1];
                const currentModule = currentFilePath.split('/')[0]; // e.g., 'frontend', 'server', 'lib', 'app', 'server-actions'

                return {
                    ImportDeclaration(node) {
                        const importPath = node.source.value;

                        // Skip if already using an alias or if it's an external module
                        if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
                            return;
                        }

                        // Resolve the absolute path of the import
                        const fileDir = path.dirname(filename);
                        const resolvedPath = normalizePath(path.resolve(fileDir, importPath));

                        // Check if the resolved path is within src
                        const resolvedSrcMatch = resolvedPath.match(/\/src\/(.+)/);
                        if (!resolvedSrcMatch) {
                            return;
                        }

                        const targetPath = resolvedSrcMatch[1];
                        const targetModule = targetPath.split('/')[0];

                        // Determine which alias should be used
                        let suggestedAlias = null;
                        let aliasPath = null;

                        if (targetModule === 'app') {
                            suggestedAlias = '@app';
                            aliasPath = targetPath.substring(4); // Remove 'app/'
                        } else if (targetModule === 'frontend') {
                            suggestedAlias = '@frontend';
                            aliasPath = targetPath.substring(9); // Remove 'frontend/'
                        } else if (targetModule === 'lib') {
                            suggestedAlias = '@lib';
                            aliasPath = targetPath.substring(4); // Remove 'lib/'
                        } else if (targetModule === 'server' && !targetPath.startsWith('server-actions')) {
                            suggestedAlias = '@server';
                            aliasPath = targetPath.substring(7); // Remove 'server/'
                        } else if (targetModule === 'server-actions' || targetPath.startsWith('server-actions')) {
                            suggestedAlias = '@server-actions';
                            aliasPath = targetPath.substring(15); // Remove 'server-actions/'
                        }

                        // Report if we found a matching alias and it's a cross-module import
                        // or if it's importing from a different directory within the same module
                        if (suggestedAlias && (targetModule !== currentModule || importPath.includes('../'))) {
                            const suggestedImport = aliasPath ? `${suggestedAlias}/${aliasPath}` : suggestedAlias;

                            context.report({
                                node,
                                messageId: 'useAlias',
                                data: {
                                    alias: suggestedImport,
                                },
                                fix(fixer) {
                                    // Replace the import path with the alias
                                    return fixer.replaceText(node.source, `'${suggestedImport}'`);
                                },
                            });
                        }
                    },
                };
            },
        },
    },
};

export default plugin;
