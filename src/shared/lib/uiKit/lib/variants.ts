import { cn } from '@/shared/lib/utils';

import { Component } from '../model';

export const variants: Record<Component, Record<string, string>> = {
	button: {
		default: cn(
			'rounded-xl bg-[var(--bg-tertiary)] ring-[var(--accent-default)]',
			'enabled:hover:bg-[var(--accent-hover)] enabled:hover:text-[var(--accent-text)] enabled:focus:ring-1',
			'ring-inset'
		),
		ghost: cn(
			'rounded-xl border-1 border-[var(--border-color)] bg-transparent',
			'enabled:hover:border-[var(--accent-hover)] enabled:hover:bg-[var(--accent-hover)] enabled:hover:text-[var(--bg-accent-text)] enabled:focus:border-[var(--accent-default)]'
		),
		accent: cn(
			'rounded-xl bg-[var(--bg-tertiary)] ring-[var(--color-primary)]',
			'enabled:bg-[var(--accent-default)] enabled:text-[var(--accent-text)] enabled:hover:bg-[var(--accent-hover)] enabled:hover:text-[var(--accent-text)] enabled:focus:ring-1',
			'ring-inset'
		),
		rounded: cn(
			'w-fit',
			'p-2',
			'aspect-square rounded-full bg-[var(--bg-tertiary)] ring-[var(--color-primary)]',
			'enabled:bg-[var(--accent-default)] enabled:text-[var(--accent-text)] enabled:hover:bg-[var(--accent-hover)] enabled:hover:text-[var(--accent-text)] enabled:focus:ring-1',
			'ring-inset'
		),
		warning: cn(
			'text-[var(--status-error)]',
			'rounded-xl border-1 border-[var(--status-error)] bg-transparent',
			'enabled:hover:border-[var(--status-error)] enabled:hover:bg-[var(--status-error)] enabled:hover:text-[var(--color-primary)] enabled:focus:border-[var(--accent-default)]'
		),
		mobile: cn('text-[var(--color-primary)]', 'bg-transparent'),
		custom: '',
	},
	input: {
		default: cn(
			'bg-[var(--bg-tertiary)] ring-[var(--accent-default)]',
			'enabled:hover:ring-1 enabled:focus:ring-1',
			'ring-inset'
		),
		ghost: cn(
			'border-1 border-[var(--border-color)] bg-transparent',
			'enabled:hover:border-[var(--accent-hover)] enabled:focus:border-[var(--accent-default)]'
		),
		custom: '',
	},
	textarea: {
		default: cn(
			'bg-[var(--bg-tertiary)] ring-[var(--accent-default)]',
			'enabled:hover:ring-1 enabled:focus:ring-1',
			'ring-inset'
		),
		ghost: cn(
			'border-1 border-[var(--border-color)] bg-transparent',
			'enabled:hover:border-[var(--accent-hover)] enabled:focus:border-[var(--accent-default)]'
		),
		custom: '',
	},
	checkbox: { default: '' },
	checkboxBool: { default: '' },
	radio: {
		default: 'bg-[var(--bg-secondary)]',
		ghost: 'bg-transparent',
		custom: '',
	},
	select: {
		default: cn(
			'bg-[var(--bg-tertiary)] ring-[var(--accent-default)]',
			'enabled:hover:ring-1 enabled:focus:ring-1',
			'ring-inset'
		),
		ghost: cn(
			'border-1 border-[var(--border-color)] bg-transparent',
			'enabled:hover:border-[var(--accent-hover)] enabled:focus:border-[var(--accent-default)]'
		),
		custom: '',
	},
	selectExt: {
		default: cn(
			'bg-[var(--bg-tertiary)] ring-[var(--accent-default)]',
			'enabled:hover:ring-1 enabled:focus:ring-1',
			'ring-inset'
		),
		ghost: cn(
			'border-1 border-[var(--border-color)] bg-transparent',
			'enabled:hover:border-[var(--accent-hover)] enabled:focus:border-[var(--accent-default)]'
		),
		custom: '',
	},
};
