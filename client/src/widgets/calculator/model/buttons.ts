import type { CalcButton } from '.';

export const buttons: CalcButton[] = [
	{ value: 'C', label: 'C', type: 'operator' },
	{ value: '(', label: '(', type: 'operator' },
	{ value: ')', label: ')', type: 'operator' },
	{ value: 'backspace', type: 'operator' },

	{ value: '7', label: '7', type: 'digit' },
	{ value: '8', label: '8', type: 'digit' },
	{ value: '9', label: '9', type: 'digit' },
	{ value: 'divide', type: 'operator' },

	{ value: '4', label: '4', type: 'digit' },
	{ value: '5', label: '5', type: 'digit' },
	{ value: '6', label: '6', type: 'digit' },
	{ value: 'multi', type: 'operator' },

	{ value: '1', label: '1', type: 'digit' },
	{ value: '2', label: '2', type: 'digit' },
	{ value: '3', label: '3', type: 'digit' },
	{ value: 'minus', type: 'operator' },

	{ value: 'plusMinus', type: 'operator' },
	{ value: '0', label: '0', type: 'digit' },
	{ value: 'decimal', type: 'operator' },
	{ value: 'plus', type: 'operator' },

	{ value: 'percent', type: 'operator', colSpan: 2 },
	{ value: 'equal', type: 'action', colSpan: 2 },
];
