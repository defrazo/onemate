import { formatFixed } from '@/shared/lib/utils';

import type { CurrencyAmount, RatesList } from '../model/types';

const NUMBER_PATTERN = /^(?:\d+(?:[.,]\d*)?|[.,]\d+)$/;
const EXPRESSION_PATTERN = /^[\d.,+\-*/\s]*$/;
const TOKEN_PATTERN = /(?:\d+(?:\.\d*)?|\.\d+)|[+\-*/]/g;

const roundAmount = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

export const isAmountInput = (value: string): boolean => EXPRESSION_PATTERN.test(value) && value.length <= 255;

export const evaluateAmount = (value: string): number | null => {
	const input = value.replace(/\s/g, '').replace(/,/g, '.');

	if (!input) return 0;
	if (!isAmountInput(value)) return null;

	const tokens = input.match(TOKEN_PATTERN);
	if (!tokens || tokens.join('') !== input) return null;

	const numbers: number[] = [];
	const operators: string[] = [];

	let expectingNumber = true;
	let sign = 1;

	for (const token of tokens) {
		if (expectingNumber) {
			if (token === '+') continue;

			if (token === '-') {
				sign *= -1;
				continue;
			}

			if (!NUMBER_PATTERN.test(token)) return null;

			const number = Number(token) * sign;
			if (!Number.isFinite(number)) return null;

			numbers.push(number);
			sign = 1;
			expectingNumber = false;
		} else {
			operators.push(token);
			expectingNumber = true;
		}
	}

	if (!numbers.length) return 0;

	while (operators.length >= numbers.length) {
		operators.pop();
	}

	for (let i = 0; i < operators.length;) {
		const operator = operators[i];

		if (operator !== '*' && operator !== '/') {
			i++;
			continue;
		}

		const left = numbers[i];
		const right = numbers[i + 1];

		if (operator === '/' && right === 0) {
			numbers.splice(i + 1, 1);
			operators.splice(i, 1);
			continue;
		}

		const result = operator === '*' ? left * right : left / right;

		if (!Number.isFinite(result)) return null;

		numbers.splice(i, 2, result);
		operators.splice(i, 1);
	}

	let result = numbers[0];

	for (let i = 0; i < operators.length; i++) {
		result = operators[i] === '+' ? result + numbers[i + 1] : result - numbers[i + 1];
	}

	return Number.isFinite(result) ? roundAmount(result) : null;
};

export const normalizeAmount = (value: string) => {
	if (!value.trim()) return '';

	if (NUMBER_PATTERN.test(value)) return value;

	const result = evaluateAmount(value);
	return result === null ? '0' : String(result);
};

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
		const amount = evaluateAmount(row.amount);
		if (amount === null) return null;

		const converted = convertAmount(amount, row.code, target, rates);
		if (converted === null) return null;

		total += converted;
	}

	return Number.isFinite(total) ? total : null;
};

export const formatSummatorSummary = (rows: readonly CurrencyAmount[], target: string, total: number) => {
	const amounts = new Map<string, number>();

	for (const row of rows) {
		if (!row.amount.trim()) continue;

		const amount = evaluateAmount(row.amount);
		if (amount === null) continue;

		amounts.set(row.code, (amounts.get(row.code) ?? 0) + amount);
	}

	const lines = Array.from(amounts, ([code, amount]) => `${code}: ${formatFixed(amount, 2)}`);

	const date = new Intl.DateTimeFormat('ru-RU').format(new Date());

	return [`Сумма валют от ${date}`, '', ...lines, '', `Итого: ${formatFixed(total, 2)} ${target}`].join('\n');
};
