import type { ResultItem } from '../model';

export const formatNumber = (num: number): string => {
	if (Number.isInteger(num)) return num.toString();
	return num.toFixed(2);
};

export const sanitizeExpression = (display: string): string => {
	let expression = display.replace(/×/g, '*').replace(/÷/g, '/');
	while (expression && !/[0-9)]$/.test(expression)) expression = expression.slice(0, -1);
	return expression;
};

export const renderResult = (result: ResultItem[]): string => {
	return result
		.slice()
		.reverse()
		.map((item) => `${item.expression} = ${item.result}`)
		.join('\n');
};

export const calculateResult = (display: string): ResultItem => {
	let expression = sanitizeExpression(display);
	let result = 'Error';

	if (!/^[-+*/().0-9\s√]+$/.test(expression)) throw new Error('Недопустимые символы в выражении');

	const jsExpression = expression.replace(/√/g, 'Math.sqrt');
	const evalResult = new Function(`return ${jsExpression}`)();

	if (typeof evalResult === 'number' && !isNaN(evalResult)) result = formatNumber(evalResult);

	return { expression, result };
};
