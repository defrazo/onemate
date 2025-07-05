export type Textbox = {
	type: string;
	language: string;
	text: string;
};

export type Language = {
	key: string;
	label: string;
	value: string;
};

export interface TranslateOptions {
	text: string;
	source: string;
	target: string;
	signal?: AbortSignal;
}
