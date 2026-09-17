export const canCalculate = (value: string) => {
	const expression = value.trim();

	if (!expression) return false;
	if (!/\d/.test(expression)) return false;
	if (!isBalancedExpression(expression)) return false;
	if (!/[\d)]$/.test(expression)) return false;

	return true;
};

export const isNumberLike = (value: string) => {
	return /^-?\d+(?:\.\d+)?$/.test(value);
};

export const isBalancedExpression = (value: string) => {
	let depth = 0;

	for (const char of value) {
		if (char === '(') {
			depth++;
			continue;
		}

		if (char === ')') {
			depth--;
			if (depth < 0) return false;
		}
	}

	return depth === 0;
};

const hasOuterParens = (value: string) => {
	if (!value.startsWith('(') || !value.endsWith(')')) return false;

	let depth = 0;

	for (let index = 0; index < value.length; index++) {
		const char = value[index];

		if (char === '(') depth++;
		if (char === ')') depth--;

		if (depth < 0) return false;

		if (depth === 0 && index < value.length - 1) return false;
	}

	return depth === 0;
};

export const stripOuterParens = (value: string) => {
	let result = value.trim();

	while (hasOuterParens(result)) result = result.slice(1, -1).trim();

	return result;
};

export const getBracketDepth = (value: string) => {
	let depth = 0;

	for (const char of value) {
		if (char === '(') depth++;
		if (char === ')') depth--;
	}

	return depth;
};
