import type { ResultItem } from '../model';

export const formatNumber = (num: number): string => {
	if (Number.isInteger(num)) return num.toString();
	return num.toFixed(2);
};

export const sanitizeExpression = (display: string): string => {
	let expression = display.replace(/×/g, '*').replace(/÷/g, '/');
	return !/[0-9)]$/.test(expression) ? expression.slice(0, -1) : expression;
};

export const renderResult = (result: ResultItem[]): string => {
	return result
		.slice()
		.reverse()
		.map((item) => `${item.expression} = ${item.result}`)
		.join('\n');
};
