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

export type TranslateRequest = {
	text: string;
	source: string;
	target: string;
	signal?: AbortSignal;
};
