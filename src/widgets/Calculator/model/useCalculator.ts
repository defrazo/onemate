import { useState } from 'react';

import {
	backspace,
	calculateResult,
	closeBracket,
	digit,
	mathDot,
	mathOperation,
	openBracket,
	plusMinus,
	sanitizeExpression,
	sqrt,
} from '../lib';
import type { ResultItem } from '.';

export const useCalculator = () => {
	const [display, setDisplay] = useState<string>('0');
	const [result, setResult] = useState<ResultItem[]>([]);

	const handleButtonClick = (value: string): void => {
		const reset = () => {
			setDisplay('0');
			setResult([]);
		};

		const off = () => {
			setDisplay('');
			setResult([]);
		};

		const handleSqrt = () => setDisplay((prev) => sqrt(prev));
		const handleBackspace = () => setDisplay((prev) => backspace(prev));
		const handleOpenBracket = () => setDisplay((prev) => openBracket(prev));
		const handleCloseBracket = () => setDisplay((prev) => closeBracket(prev));
		const handlePlusMinus = () => setDisplay((prev) => plusMinus(prev));
		const handleMathDot = () => setDisplay((prev) => mathDot(prev));
		const handleMathOperation = (value: string) => setDisplay((prev) => mathOperation(prev, value));
		const handleDigit = (value: string) => setDisplay((prev) => digit(prev, value));

		/* prettier-ignore */
		switch (value) {
			case 'ON/C': reset(); break;
			case 'OFF': off(); break;
			case '√': handleSqrt(); break;
			case '⌫': handleBackspace(); break;
			case '(': handleOpenBracket(); break;
			case ')': handleCloseBracket(); break;
			case '±': handlePlusMinus(); break;
			case '.': handleMathDot(); break;
			case '÷':
			case '×':
			case '-':
			case '+': handleMathOperation(value); break;
			case '0':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9': handleDigit(value); break;
			case '=': handleResult(display); break;
			default: break;
		}
	};

	const handleResult = (display: string): string => {
		const expr = sanitizeExpression(display);

		if (!expr) {
			setDisplay('0');
			return '0';
		}

		const isNumberLike = (string: string): boolean => /^-?\d+(?:\.\d+)?$/.test(string);
		const stripOuterParens = (string: string): string => {
			let out = string.trim();
			const balanced = (text: string) => {
				let counter = 0;
				for (const char of text) {
					if (char === '(') counter++;
					else if (char === ')') {
						counter--;
						if (counter < 0) return false;
					}
				}
				return counter === 0;
			};
			while (out.startsWith('(') && out.endsWith(')') && balanced(out)) out = out.slice(1, -1).trim();

			return out;
		};

		const core = stripOuterParens(expr);
		if (isNumberLike(core)) {
			setDisplay(expr);
			return expr;
		}

		try {
			const { expression, result } = calculateResult(expr);
			const safeResult = result ?? 'Error';
			setResult((prev) => [...prev, { expression, result: safeResult }]);
			setDisplay(safeResult);
			return safeResult;
		} catch {
			setDisplay('Error');
			return 'Error';
		}
	};

	return { handleButtonClick, display, result };
};
