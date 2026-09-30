import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginReact from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import eslintPluginSimpleImportSort from 'eslint-plugin-simple-import-sort';

export default [
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
			globals: {
				window: 'readonly',
				document: 'readonly',
				console: 'readonly',
			},
		},
		plugins: {
			'@typescript-eslint': typescriptEslintPlugin,
			prettier: eslintPluginPrettier,
			react: eslintPluginReact,
			import: eslintPluginImport,
			'react-hooks': reactHooks,
			'simple-import-sort': eslintPluginSimpleImportSort,
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
		rules: {
			// TypeScript
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{
					prefer: 'type-imports',
					fixStyle: 'inline-type-imports',
				},
			],

			// Imports / exports
			'simple-import-sort/imports': [
				'error',
				{
					groups: [
						['^\\u0000'],
						['^react$', '^react-dom', '^@?\\w'],
						['^@/'],
						['^\\.'],
						['^.+\\.(?:css|scss|sass|less)$'],
					],
				},
			],
			'simple-import-sort/exports': 'error',
			'import/first': 'error',

			// React
			'react/jsx-sort-props': [
				'warn',
				{
					callbacksLast: true,
					shorthandFirst: true,
					reservedFirst: true,
					noSortAlphabetically: false,
				},
			],

			// React Hooks
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',

			// General
			'no-console': 'off',
			'no-duplicate-imports': [
				'error',
				{
					allowSeparateTypeImports: true,
				},
			],
			'object-shorthand': ['warn', 'always'],
			'prefer-const': 'error',

			// Formatting
			'prettier/prettier': 'error',
			},
	},
	{
		ignores: ['dist', 'node_modules', 'env.d.ts', 'tailwind.config.js'],
	},
];