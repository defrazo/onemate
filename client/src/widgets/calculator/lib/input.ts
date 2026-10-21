import type { ButtonValue } from '../model';
import { getBracketDepth } from '.';

const MAX_BRACKET_DEPTH = 5;

type BinaryOperator = Extract<ButtonValue, 'plus' | 'minus' | 'multi' | 'divide' | 'percent'>;

const operatorSymbols: Record<BinaryOperator, string> = {
	plus: '+',
	minus: '-',
	multi: '×',
	divide: '÷',
	percent: '%',
};

export const digit = (prev: string, value: string) => {
	if (prev === '0' || prev === 'Error' || !prev) return value;
	return prev + value;
};

export const mathDot = (prev: string) => {
	if (prev === 'Error' || !prev) return '0.';

	const trimmed = prev.trimEnd();
	if (/[+\-×÷%(]$/.test(trimmed)) return `${prev}0.`;

	const currentNumber = trimmed.match(/\d+(?:\.\d*)?$/)?.[0];
	if (!currentNumber || currentNumber.includes('.')) return prev;

	return `${prev}.`;
};

export const mathOperation = (prev: string, operator: BinaryOperator) => {
	const symbol = operatorSymbols[operator];

	if (prev === 'Error' || !prev) return operator === 'minus' ? '-' : '0';

	const trimmed = prev.trimEnd();
	if (trimmed === '0') return operator === 'minus' ? '-' : prev;

	if (/[+\-×÷%]$/.test(trimmed)) {
		const expression = trimmed.slice(0, -1).trimEnd();
		if (!expression) return operator === 'minus' ? '-' : '0';
		return `${expression} ${symbol} `;
	}

	if (/[\d)]$/.test(trimmed)) return `${trimmed} ${symbol} `;

	return prev;
};

export const openBracket = (prev: string) => {
	if (prev === '0' || prev === 'Error' || !prev) return '(';

	const trimmed = prev.trimEnd();
	if (getBracketDepth(trimmed) >= MAX_BRACKET_DEPTH) return prev;
	if (/[+\-×÷%(]$/.test(trimmed)) return `${prev}(`;

	return prev;
};

export const closeBracket = (prev: string) => {
	const trimmed = prev.trimEnd();

	const openCount = (trimmed.match(/\(/g) ?? []).length;
	const closeCount = (trimmed.match(/\)/g) ?? []).length;

	if (closeCount >= openCount) return prev;

	if (!/[\d)]$/.test(trimmed)) return prev;

	return `${trimmed})`;
};

export const backspace = (prev: string) => {
	if (prev === '0' || prev === 'Error' || !prev) return '0';

	const trimmed = prev.trimEnd();

	if (/[+\-×÷%]$/.test(trimmed)) {
		const expression = trimmed.slice(0, -1).trimEnd();
		return expression || '0';
	}

	const result = trimmed.slice(0, -1);

	return result || '0';
};

export const plusMinus = (prev: string) => {
	if (prev === 'Error' || !prev) return '0';

	const trimmed = prev.trimEnd();

	const negativeMatch = trimmed.match(/\(-(\d+(?:\.\d+)?)\)$/);

	if (negativeMatch) {
		const negative = negativeMatch[0];
		const number = negativeMatch[1];

		return trimmed.slice(0, -negative.length) + number;
	}

	const numberMatch = trimmed.match(/(\d+(?:\.\d+)?)$/);
	if (!numberMatch) return prev;

	const number = numberMatch[0];

	return `${trimmed.slice(0, -number.length)}(-${number})`;
};
