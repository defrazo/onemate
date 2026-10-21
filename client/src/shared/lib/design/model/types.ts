import type { paddings, variants } from '../lib';

export type Component = 'button' | 'input' | 'textarea' | 'checkbox' | 'radio' | 'select';

export type VariantMap = {
	button: keyof typeof variants.button;
	input: keyof typeof variants.input;
	textarea: keyof typeof variants.textarea;
	checkbox: keyof typeof variants.checkbox;
	radio: keyof typeof variants.radio;
	select: keyof typeof variants.select;
};

export type Padding = keyof typeof paddings;
