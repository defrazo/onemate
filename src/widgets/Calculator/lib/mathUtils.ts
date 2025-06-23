export const sqrt = (prev: string): string => {
	if (prev === '0') return prev;
	return /\√/.test(prev) ? prev.replace('√', '') : '√' + prev;
};

export const backspace = (prev: string): string => {
	if (prev === '0') return '0';
	return prev.length > 1 ? prev.slice(0, -1) : '0';
};

export const openBracket = (prev: string): string => {
	if (prev === '0') return '(';
	return /[\d\(]/.test(prev.slice(-1)) ? prev : prev + '(';
};

export const closeBracket = (prev: string): string => {
	if (!prev.includes('(')) return prev;

	const openCount = (prev.match(/\(/g) || []).length;
	const closeCount = (prev.match(/\)/g) || []).length;
	if (closeCount >= openCount) return prev;

	const lastOpenIndex = prev.lastIndexOf('(');
	const inside = prev.slice(lastOpenIndex + 1);

	const hasDigit = /\d/.test(inside);
	const hasOperator = /[+\-×/]/.test(inside);

	if (hasDigit && hasOperator) {
		const lastChar = prev.slice(-1);
		if (/\d|\)/.test(lastChar)) return prev + ')';
	}

	return prev;
};

export const plusMinus = (value: string): string => {
	const arr = value.match(/(\d+|[^\d])/g);

	if (!arr) return value;

	const arr2 = arr.slice();
	const lastIndex = arr.length - 1;
	const secondLastIndex = arr.length - 2;

	if (!isNaN(Number(arr[lastIndex]))) {
		if (arr[secondLastIndex] === '-') arr2[secondLastIndex] = '';
		else arr2[lastIndex] = '-' + arr[lastIndex];
	}

	return arr2.join('') || '0';
};

export const mathDot = (prev: string): string => {
	if (/[0-9]$/.test(prev)) {
		if (!/(\.\d*)$/.test(prev)) return prev + '.';
	}

	return prev;
};

export const mathOperation = (prev: string, value: string): string => {
	if (prev === '0') return '0';

	if (/[0-9]$/.test(prev)) return prev + value;

	return prev.slice(0, -1) + value;
};

export const digit = (prev: string, value: string): string => {
	return prev === '0' ? value : prev + value;
};
