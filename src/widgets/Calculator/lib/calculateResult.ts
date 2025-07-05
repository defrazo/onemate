import type { ResultItem } from '../model';
import { formatNumber, sanitizeExpression } from '.';

export const calculateResult = (display: string): ResultItem => {
	let expression = sanitizeExpression(display);
	let result = 'Error';

	try {
		if (!/^[-+*/().0-9\s√]+$/.test(expression)) throw new Error('Недопустимые символы в выражении');

		const jsExpression = expression.replace(/√/g, 'Math.sqrt');
		const evalResult = new Function(`return ${jsExpression}`)();

		if (typeof evalResult === 'number' && !isNaN(evalResult)) result = formatNumber(evalResult);
	} catch {}

	return { expression, result };
};
