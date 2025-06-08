import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import eslintPluginReact from 'eslint-plugin-react';
import typescriptParser from '@typescript-eslint/parser';

export default [
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				project: './tsconfig.json',
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
			'simple-import-sort': eslintPluginSimpleImportSort,
			react: eslintPluginReact,
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
		rules: {
			'@typescript-eslint/no-unused-vars': 'warn',
			'no-console': 'off',
			'array-bracket-newline': ['off'],
			'array-element-newline': ['off'],
			'prettier/prettier': 'error',
			'simple-import-sort/imports': [
				'warn',
				{
					groups: [['^react', '^@?\\w'], ['^@/'], ['^\\.'], ['\\.s?css$']],
				},
			],
			'simple-import-sort/exports': 'warn',
			'react/jsx-sort-props': [
				'warn',
				{
					callbacksLast: true, // onClick, onChange и прочие — всегда в конце
					shorthandFirst: false, // не важно: сокращённые props или полные
					noSortAlphabetically: false, // ⬅️ обязательно false для каноничного порядка!
					reservedFirst: true, // key, ref — всегда сверху
				},
			],
		},
	},
	{
		ignores: ['dist', 'node_modules', 'vite.config.ts', 'tailwind.config.js'],
	},
];
