import svelte from 'eslint-plugin-svelte';
import tsParser from '@typescript-eslint/parser';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // Ignore build artifacts
  { ignores: ['node_modules', 'build', 'dist', '.svelte-kit'] },

  // Svelte recommended
  ...svelte.configs['flat/recommended'],

  // Enable TypeScript in <script lang="ts"> within .svelte files
  {
    files: ['*.svelte', '**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.svelte'],
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
  // Relax some rules for this project
  {
    files: ['*.svelte', '**/*.svelte'],
    rules: {
      'svelte/no-navigation-without-resolve': 'off',
      'svelte/no-dom-manipulating': 'off',
      'svelte/require-each-key': 'warn',
    },
  },
];
