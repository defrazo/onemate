export interface CalcButton {
	value: ButtonValue;
	label?: string;
	type: 'digit' | 'operator' | 'action';
	colSpan?: 1 | 2;
}

export type CalcDigit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

export type ButtonValue =
	| 'C'
	| 'backspace'
	| '('
	| ')'
	| 'plusMinus'
	| 'decimal'
	| 'percent'
	| 'divide'
	| 'multi'
	| 'minus'
	| 'plus'
	| 'equal'
	| '0'
	| '1'
	| '2'
	| '3'
	| '4'
	| '5'
	| '6'
	| '7'
	| '8'
	| '9';

export type ResultItem = {
	expression: string;
	result: string;
};
