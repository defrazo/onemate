import { sizes, variants } from '../lib';

export type Component =
	| 'button'
	| 'input'
	| 'textarea'
	| 'checkbox'
	| 'checkboxBool'
	| 'radio'
	| 'select'
	| 'selectExt';

export type VariantMap = {
	button: keyof typeof variants.button;
	input: keyof typeof variants.input;
	textarea: keyof typeof variants.textarea;
	checkbox: keyof typeof variants.checkbox;
	checkboxBool: keyof typeof variants.checkboxBool;
	radio: keyof typeof variants.radio;
	select: keyof typeof variants.select;
	selectExt: keyof typeof variants.selectExt;
};

export type SizeMap = {
	button: keyof typeof sizes.button;
	input: keyof typeof sizes.input;
	textarea: keyof typeof sizes.textarea;
	checkbox: keyof typeof sizes.checkbox;
	checkboxBool: keyof typeof sizes.checkboxBool;
	radio: keyof typeof sizes.radio;
	select: keyof typeof sizes.select;
	selectExt: keyof typeof sizes.selectExt;
};
