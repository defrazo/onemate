import { formatFixed } from '@/shared/lib/utils';

import type { CurrencyAmount, RatesList } from '../model/types';

const parseAmount = (value: string) => {
	const normalized = value.replace(',', '.');
	return Number(normalized === '.' ? '0' : normalized || '0');
};

export const isAmountInput = (value: string) => /^\d*(?:[.,]\d*)?$/.test(value) && Number.isFinite(parseAmount(value));

export const convertAmount = (amount: number, from: string, to: string, rates: RatesList): number | null => {
	const fromRate = rates[from]?.value;
	const toRate = rates[to]?.value;

	if (
		!Number.isFinite(amount) ||
		!Number.isFinite(fromRate) ||
		!Number.isFinite(toRate) ||
		fromRate <= 0 ||
		toRate <= 0
	) {
		return null;
	}

	const result = amount * (toRate / fromRate);
	return Number.isFinite(result) ? result : null;
};

export const sumCurrencies = (rows: readonly CurrencyAmount[], target: string, rates: RatesList): number | null => {
	if (convertAmount(0, target, target, rates) === null) return null;

	let total = 0;

	for (const row of rows) {
		if (!isAmountInput(row.amount)) return null;

		const converted = convertAmount(parseAmount(row.amount), row.code, target, rates);
		if (converted === null) return null;

		total += converted;
	}

	return Number.isFinite(total) ? total : null;
};

export const formatSummatorSummary = (rows: readonly CurrencyAmount[], target: string, total: number) => {
	const amounts = new Map<string, number>();

	for (const row of rows) {
		if (!row.amount.trim() || !isAmountInput(row.amount)) continue;

		const amount = parseAmount(row.amount);
		amounts.set(row.code, (amounts.get(row.code) ?? 0) + amount);
	}

	const lines = Array.from(amounts, ([code, amount]) => `${code}: ${formatFixed(amount, 2)}`);
	const date = new Intl.DateTimeFormat('ru-RU').format(new Date());

	return [`Сумма валют от ${date}`, '', ...lines, '', `Итого: ${formatFixed(total, 2)} ${target}`].join('\n');
};
