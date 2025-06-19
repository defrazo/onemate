import { Component } from '../model';

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
		sm: 'h-4 w-4',
		md: 'h-5 w-5',
		lg: 'h-6 w-6',
		custom: '',
	},
	checkboxBool: {
		sm: 'h-4 w-4',
		md: 'h-5 w-5',
		lg: 'h-6 w-6',
		custom: '',
	},
	radio: {
		sm: 'h-4 w-4',
		md: 'h-5 w-5',
		lg: 'h-6 w-6',
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
