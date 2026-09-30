import type { sizes, variants } from '../lib';

export type Component = 'button' | 'input' | 'textarea' | 'checkbox' | 'radio' | 'select';

export type VariantMap = {
	button: keyof typeof variants.button;
	input: keyof typeof variants.input;
	textarea: keyof typeof variants.textarea;
	checkbox: keyof typeof variants.checkbox;
	radio: keyof typeof variants.radio;
	select: keyof typeof variants.select;
};

export type SizeMap = {
	button: keyof typeof sizes.button;
	input: keyof typeof sizes.input;
	textarea: keyof typeof sizes.textarea;
	checkbox: keyof typeof sizes.checkbox;
	radio: keyof typeof sizes.radio;
	select: keyof typeof sizes.select;
};
