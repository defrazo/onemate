export interface CalculatorButton {
	label: string;
	colSpan?: number;
}

export type ResultItem = {
	expression: string;
	result: string | undefined;
};
