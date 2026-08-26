/** @type {import('prettier').Config} */
export default {
	semi: true,
	singleQuote: true,
	arrowParens: 'always',
	bracketSpacing: true,
	jsxSingleQuote: false,
	tabWidth: 4,
	useTabs: true,
	trailingComma: 'es5',
	printWidth: 120,
	endOfLine: 'auto',
	plugins: ['prettier-plugin-tailwindcss'],
};
