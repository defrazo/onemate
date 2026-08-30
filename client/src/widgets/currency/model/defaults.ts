import type { Currency } from '.';

const DEFAULT_CURRENCIES: Currency[] = [
	{ type: 'base', code: 'USD', value: 1 },
	{ type: 'target', code: 'RUB', value: 0 },
];
export const createDefaultCurrencies = (): Currency[] => DEFAULT_CURRENCIES.map((c) => ({ ...c }));
