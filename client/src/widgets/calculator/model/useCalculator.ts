import { useState } from 'react';

import {
	backspace,
	calculateResult,
	canCalculate,
	closeBracket,
	digit,
	isNumberLike,
	mathDot,
	mathOperation,
	openBracket,
	plusMinus,
	stripOuterParens,
} from '../lib';
import type { ButtonValue, CalcDigit, ResultItem } from '.';

const isDigit = (value: ButtonValue): value is CalcDigit => /^\d$/.test(value);

const isBinaryOperator = (value: ButtonValue): value is 'plus' | 'minus' | 'multi' | 'divide' | 'percent' => {
	return value === 'plus' || value === 'minus' || value === 'multi' || value === 'divide' || value === 'percent';
};

export const useCalculator = () => {
	const [display, setDisplay] = useState('0');
	const [result, setResult] = useState<ResultItem[]>([]);
	const [isResultShown, setIsResultShown] = useState(false);

	const clear = () => {
		setDisplay('0');
		setIsResultShown(false);
	};

	const clearHistory = () => {
		setDisplay('0');
		setResult([]);
	};

	const calculate = () => {
		const expression = display.trim();

		if (!canCalculate(expression)) return;

		const core = stripOuterParens(expression);

		if (isNumberLike(core)) {
			setDisplay(expression);
			setIsResultShown(true);
			return;
		}

		try {
			const calculation = calculateResult(expression);

			setResult((prev) => [...prev, calculation]);
			setDisplay(calculation.result);
			setIsResultShown(true);
		} catch {
			setDisplay('Error');
			setIsResultShown(false);
		}
	};

	const handleButtonClick = (value: ButtonValue) => {
		if (isResultShown && isDigit(value)) {
			setDisplay(value);
			setIsResultShown(false);
			return;
		}

		if (isResultShown) {
			if (value === 'decimal') {
				setDisplay('0.');
				setIsResultShown(false);
				return;
			}

			if (value === '(') {
				setDisplay('(');
				setIsResultShown(false);
				return;
			}

			if (isBinaryOperator(value)) setIsResultShown(false);
		}

		if (isDigit(value)) {
			setDisplay((prev) => digit(prev, value));
			return;
		}

		/* prettier-ignore */
		switch (value) {
			case 'C': clear(); break;
			case 'backspace': setDisplay((prev) => backspace(prev)); break;
			case '(': setDisplay((prev) => openBracket(prev)); break;
			case ')': setDisplay((prev) => closeBracket(prev)); break;
			case 'plusMinus': setDisplay((prev) => plusMinus(prev)); break;
			case 'decimal': setDisplay((prev) => mathDot(prev)); break;
			case 'plus':
			case 'minus':
			case 'multi':
			case 'divide':
			case 'percent': setDisplay((prev) => mathOperation(prev, value)); break;
			case 'equal': calculate(); break;
		}
	};

	return { display, result, clearHistory, handleButtonClick };
};
