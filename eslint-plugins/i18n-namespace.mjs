import path from 'path';

/**
 * Converts a file path to the expected namespace format.
 * e.g., src/app/(1village)/Activities.tsx -> app.(1village).Activities
 *       src/frontend/components/path/to/MyComponent.tsx -> MyComponent
 */
function filePathToNamespace(filePath) {
    const srcIndex = filePath.indexOf('src/');
    if (srcIndex === -1) {
        return null;
    }
    const relativePath = filePath.slice(srcIndex + 4); // Remove 'src/'

    if (relativePath.startsWith('app')) {
        return path.parse(relativePath).dir.replace(/\//g, '.');
    } else if (relativePath.startsWith('frontend')) {
        const extension = path.extname(relativePath);
        return path.basename(relativePath, extension);
    } else {
        return null;
    }
}

/** @type {import('eslint').ESLint.Plugin} */
const plugin = {
    meta: {
        name: 'eslint-plugin-i18n-namespace',
        version: '1.0.0',
    },
    rules: {
        'valid-namespace': {
            meta: {
                type: 'problem',
                docs: {
                    description: 'Enforce valid namespace for useExtracted/getExtracted hooks',
                },
                messages: {
                    invalidNamespace: "Invalid namespace '{{actual}}'. Expected 'common' or '{{expected}}' (based on file path).",
                    missingNamespace: 'Missing namespace argument for {{functionName}}.',
                    dynamicNamespace: 'Namespace must be a static string literal.',
                },
                schema: [],
            },
            create(context) {
                const filename = context.filename || context.getFilename();

                return {
                    CallExpression(node) {
                        // Check if it's a call to useExtracted or getExtracted
                        if (node.callee.type !== 'Identifier') {
                            return;
                        }

                        const functionName = node.callee.name;
                        if (functionName !== 'useExtracted' && functionName !== 'getExtracted') {
                            return;
                        }

                        // Check if there's a namespace argument
                        if (node.arguments.length === 0) {
                            context.report({
                                node,
                                messageId: 'missingNamespace',
                                data: { functionName },
                            });
                            return;
                        }

                        const namespaceArg = node.arguments[0];

                        // Namespace must be a string literal
                        if (namespaceArg.type !== 'Literal' || typeof namespaceArg.value !== 'string') {
                            context.report({
                                node: namespaceArg,
                                messageId: 'dynamicNamespace',
                            });
                            return;
                        }

                        const actualNamespace = namespaceArg.value;

                        // 'common' is always valid
                        if (actualNamespace === 'common') {
                            return;
                        }

                        // Check if namespace matches the file path
                        const expectedNamespace = filePathToNamespace(filename);

                        if (expectedNamespace && actualNamespace !== expectedNamespace) {
                            context.report({
                                node: namespaceArg,
                                messageId: 'invalidNamespace',
                                data: {
                                    actual: actualNamespace,
                                    expected: expectedNamespace,
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
