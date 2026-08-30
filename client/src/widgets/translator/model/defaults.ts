import type { Textbox } from '.';

const DEFAULT_TRANSLATOR: Textbox[] = [
	{ type: 'source', language: 'ru', text: '' },
	{ type: 'target', language: 'en', text: '' },
];
export const createDefaultTranslator = (): Textbox[] => DEFAULT_TRANSLATOR.map((t) => ({ ...t }));
