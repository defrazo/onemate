import type { Component } from '../model';

export const sizes: Record<Component, Record<string, string>> = {
	button: {
		sm: 'text-sm py-1 px-3',
		md: 'text-base py-2 px-4',
		lg: 'text-lg py-3 px-6',
		custom: '',
	},
	input: {
		sm: 'text-sm py-1 px-2',
		md: 'text-base py-2 px-2',
		lg: 'text-lg py-3 px-4',
		custom: '',
	},
	textarea: {
		sm: 'text-sm py-1 px-3',
		md: 'text-base py-2 px-4',
		lg: 'text-lg py-3 px-6',
		custom: '',
	},
	checkbox: {
		sm: 'size-4',
		md: 'size-5',
		lg: 'size-6',
		custom: '',
	},
	checkboxBool: {
		sm: 'size-4',
		md: 'size-5',
		lg: 'size-6',
		custom: '',
	},
	radio: {
		sm: 'size-4',
		md: 'size-5',
		lg: 'size-6',
		custom: '',
	},
	select: {
		sm: 'text-sm py-1 pl-2 pr-8',
		md: 'text-base py-2 pl-3 pr-8',
		lg: 'text-lg py-3 pl-4 pr-10',
		custom: '',
	},
	selectExt: {
		sm: 'text-sm py-1 px-3',
		md: 'text-base py-2 px-4',
		lg: 'text-lg py-3 px-6',
		custom: '',
	},
};
