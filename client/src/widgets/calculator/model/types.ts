export type CalculatorButton = {
	label: string;
	type: string;
	colSpan?: number;
};

export type ResultItem = {
	expression: string;
	result: string | undefined;
};
