import js from '@eslint/js';
import tsEslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default [
    // Base JS recommended rules
    js.configs.recommended,

    // TypeScript recommended rules
    ...tsEslint.configs.recommended,

    {
        ignores: [
            '**/.cache/**',
            '**/dist/**',
            '**/lib/**',
            '**/node_modules/**',
        ],
    },

    {
        files: ['**/*.{ts,tsx}'],

        languageOptions: {
            parser: tsEslint.parser,
        },

        plugins: {
            '@typescript-eslint': tsEslint.plugin,
            '@stylistic': stylistic,
        },

        rules: {
            // Style / formatting
            semi: ['error', 'always'],
            curly: 'error',
            indent: 'error',
            'no-tabs': 'error',

            // Code quality
            'consistent-return': 'error',
            complexity: ['error', 10],
            'no-await-in-loop': 'warn',
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'prefer-promise-reject-errors': 'warn',

            // Shadowing
            'no-shadow': 'off',
            '@typescript-eslint/no-shadow': 'error',

            // Use-before-define
            'no-use-before-define': 'off',
            '@typescript-eslint/no-use-before-define': 'error',
        },
    },
];
