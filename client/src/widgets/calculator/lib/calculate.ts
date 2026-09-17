import type { ResultItem } from '../model';
import { isBalancedExpression } from '.';

export const formatNumber = (value: number) => {
	if (!Number.isFinite(value)) return 'Error';
	return Number(value.toFixed(10)).toString();
};

const toExecutableExpression = (value: string) => {
	let expression = value.replaceAll('×', '*').replaceAll('÷', '/');

	expression = expression.replace(
		/(-?\d+(?:\.\d+)?|\([^()]+\))\s*%\s*(-?\d+(?:\.\d+)?|\([^()]+\))/g,
		'($1 * $2 / 100)'
	);

	return expression;
};

export const calculateResult = (display: string): ResultItem => {
	const expression = display.trim();
	if (!expression) throw new Error('Пустое выражение');

	if (!isBalancedExpression(expression)) throw new Error('Несбалансированные скобки');

	const executableExpression = toExecutableExpression(expression);
	if (!/^[-+*/().0-9\s]+$/.test(executableExpression)) throw new Error('Недопустимые символы в выражении');

	const calculated = Function(`"use strict"; return (${executableExpression});`)();
	if (typeof calculated !== 'number' || !Number.isFinite(calculated)) throw new Error('Некорректный результат');

	return { expression, result: formatNumber(calculated) };
};
