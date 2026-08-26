import { cn } from '@/shared/lib/utils';

import type { Component } from '../model';

export const variants: Record<Component, Record<string, string>> = {
	button: {
		default: cn(
			'rounded-xl ring-inset',
			'bg-(--bg-tertiary) ring-(--accent-default)',
			'hover:bg-(--accent-hover) hover:text-(--accent-text) focus-visible:ring-1'
		),
		ghost: cn(
			'rounded-xl border border-solid',
			'border-(--border-color) bg-transparent',
			'hover:border-(--accent-hover) hover:bg-(--accent-hover) hover:text-(--bg-accent-text) focus-visible:border-(--accent-default)'
		),
		accent: cn(
			'rounded-xl border border-solid ring-inset',
			'border-(--border-light) bg-(--accent-default) text-(--accent-text) ring-(--color-primary)',
			'hover:bg-(--accent-hover) hover:text-(--accent-text) focus-visible:ring-1'
		),
		rounded: cn(
			'aspect-square w-fit rounded-full p-2 ring-inset',
			'bg-(--bg-tertiary) text-(--accent-text) ring-(--color-primary)',
			'hover:bg-(--accent-hover) hover:text-(--accent-text) focus-visible:ring-1'
		),
		warning: cn(
			'rounded-xl border border-solid',
			'border-(--border-color) bg-(--bg-tertiary) text-(--color-disabled)',
			'hover:border-(--status-error) hover:bg-(--status-error) hover:text-(--accent-text)'
		),
		mobile: 'bg-transparent text-(--color-primary)',
		custom: '',
	},
	input: {
		default: cn('ring-inset', 'bg-(--bg-tertiary) ring-(--accent-default)', 'focus:ring-1 hover:enabled:ring-1'),
		ghost: cn(
			'border border-solid',
			'border-(--border-color) bg-transparent',
			'hover:border-(--accent-hover) focus:border-(--accent-default)'
		),
		custom: '',
	},
	textarea: {
		default: cn('ring-inset', 'bg-(--bg-tertiary) ring-(--accent-default)', 'hover:ring-1 focus:ring-1'),
		ghost: cn(
			'border border-solid',
			'border-(--border-color) bg-transparent',
			'hover:border-(--accent-hover) focus:border-(--accent-default)'
		),
		custom: '',
	},
	checkbox: { default: '' },
	checkboxBool: { default: '' },
	radio: { default: 'border-(--border-color)', custom: '' },
	select: {
		default: cn('ring-inset', 'bg-(--bg-tertiary) ring-(--accent-default)', 'hover:ring-1 focus:ring-1'),
		ghost: cn(
			'border border-solid',
			'border-(--border-color) bg-transparent',
			'hover:border-(--accent-hover) focus:border-(--accent-default)'
		),
		custom: '',
	},
	selectExt: {
		default: cn('ring-inset', 'bg-(--bg-tertiary) ring-(--accent-default)', 'hover:ring-1 focus:ring-1'),
		embedded: cn(
			'border border-solid',
			'border-(--border-color) bg-transparent',
			'hover:border-(--accent-hover-op) focus:border-(--accent-default-op)'
		),
		detached: '',
		custom: '',
	},
};
