import { cn } from '@/shared/lib/utils';

import type { Component } from '../model';

export const variants: Record<Component, Record<string, string>> = {
	button: {
		default: cn(
			'rounded-xl bg-[var(--bg-tertiary)] ring-[var(--accent-default)]',
			'hover:enabled:bg-[var(--accent-hover)] hover:enabled:text-[var(--accent-text)] focus-visible:enabled:ring-1',
			'ring-inset'
		),
		ghost: cn(
			'rounded-xl border border-solid border-[var(--border-color)] bg-transparent',
			'hover:enabled:border-[var(--accent-hover)] hover:enabled:bg-[var(--accent-hover)] hover:enabled:text-[var(--bg-accent-text)] focus-visible:enabled:border-[var(--accent-default)]'
		),
		accent: cn(
			'rounded-xl bg-[var(--bg-tertiary)] ring-[var(--color-primary)]',
			'enabled:bg-[var(--accent-default)] enabled:text-[var(--accent-text)] hover:enabled:bg-[var(--accent-hover)] hover:enabled:text-[var(--accent-text)] focus-visible:enabled:ring-1',
			'ring-inset'
		),
		rounded: cn(
			'w-fit',
			'p-2',
			'aspect-square rounded-full bg-[var(--bg-tertiary)] ring-[var(--color-primary)]',
			'enabled:bg-[var(--accent-default)] enabled:text-[var(--accent-text)] hover:enabled:bg-[var(--accent-hover)] hover:enabled:text-[var(--accent-text)] focus-visible:enabled:ring-1',
			'ring-inset'
		),
		warning: cn(
			'enabled:text-[var(--status-error)]',
			'rounded-xl border  border-[var(--border-color)] bg-transparent enabled:border-[var(--status-error)]',
			'hover:enabled:border-[var(--status-error)] hover:enabled:bg-[var(--status-error)] hover:enabled:text-[var(--color-primary)] focus-visible:enabled:border-[var(--accent-default)]'
		),
		mobile: cn('text-[var(--color-primary)]', 'bg-transparent'),
		custom: '',
	},
	input: {
		default: cn(
			'bg-[var(--bg-tertiary)] ring-[var(--accent-default)]',
			'hover:enabled:ring-1 focus:enabled:ring-1',
			'ring-inset'
		),
		ghost: cn(
			'border border-solid border-[var(--border-color)] bg-transparent',
			'hover:enabled:border-[var(--accent-hover)] focus:enabled:border-[var(--accent-default)]'
		),
		custom: '',
	},
	textarea: {
		default: cn(
			'bg-[var(--bg-tertiary)] ring-[var(--accent-default)]',
			'hover:enabled:ring-1 focus:enabled:ring-1',
			'ring-inset'
		),
		ghost: cn(
			'border border-solid border-[var(--border-color)] bg-transparent',
			'hover:enabled:border-[var(--accent-hover)] focus:enabled:border-[var(--accent-default)]'
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
			'hover:enabled:ring-1 focus:enabled:ring-1',
			'ring-inset'
		),
		ghost: cn(
			'border border-solid border-[var(--border-color)] bg-transparent',
			'hover:enabled:border-[var(--accent-hover)] focus:enabled:border-[var(--accent-default)]'
		),
		custom: '',
	},
	selectExt: {
		default: cn(
			'bg-[var(--bg-tertiary)] ring-[var(--accent-default)]',
			'hover:enabled:ring-1 focus:enabled:ring-1',
			'ring-inset'
		),
		ghost: cn(
			'border border-solid border-[var(--border-color)] bg-transparent',
			'hover:enabled:border-[var(--accent-hover)] focus:enabled:border-[var(--accent-default)]'
		),
		custom: '',
	},
};
