import { cn } from '@/shared/lib/utils';

import type { Component } from '../model';

export const variants: Record<Component, Record<string, string>> = {
	button: {
		default: cn(
			'rounded-xl bg-[var(--bg-tertiary)] ring-[var(--accent-default)]',
			'hover:bg-[var(--accent-hover)] hover:text-[var(--accent-text)] focus-visible:ring-1',
			'ring-inset'
		),
		ghost: cn(
			'rounded-xl border border-solid border-[var(--border-color)] bg-transparent',
			'hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)] hover:text-[var(--bg-accent-text)] focus-visible:border-[var(--accent-default)]'
		),
		accent: cn(
			'rounded-xl bg-[var(--bg-tertiary)] ring-[var(--color-primary)]',
			'bg-[var(--accent-default)] text-[var(--accent-text)] hover:bg-[var(--accent-hover)] hover:text-[var(--accent-text)] focus-visible:ring-1',
			'ring-inset'
		),
		rounded: cn(
			'w-fit',
			'p-2',
			'aspect-square rounded-full bg-[var(--bg-tertiary)] ring-[var(--color-primary)]',
			'bg-[var(--accent-default)] text-[var(--accent-text)] hover:bg-[var(--accent-hover)] hover:text-[var(--accent-text)] focus-visible:ring-1',
			'ring-inset'
		),
		warning: cn(
			'text-[var(--status-error)]',
			'rounded-xl border border-[var(--border-color)] bg-transparent border-[var(--status-error)]',
			'hover:border-[var(--status-error)] hover:bg-[var(--status-error)] hover:text-[var(--color-primary)] focus-visible:border-[var(--accent-default)]'
		),
		mobile: cn('text-[var(--color-primary)]', 'bg-transparent'),
		custom: '',
	},
	input: {
		default: cn('bg-[var(--bg-tertiary)] ring-[var(--accent-default)]', 'hover:ring-1 focus:ring-1', 'ring-inset'),
		ghost: cn(
			'border border-solid border-[var(--border-color)] bg-transparent',
			'hover:border-[var(--accent-hover)] focus:border-[var(--accent-default)]'
		),
		custom: '',
	},
	textarea: {
		default: cn('bg-[var(--bg-tertiary)] ring-[var(--accent-default)]', 'hover:ring-1 focus:ring-1', 'ring-inset'),
		ghost: cn(
			'border border-solid border-[var(--border-color)] bg-transparent',
			'hover:border-[var(--accent-hover)] focus:border-[var(--accent-default)]'
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
		default: cn('bg-[var(--bg-tertiary)] ring-[var(--accent-default)]', 'hover:ring-1 focus:ring-1', 'ring-inset'),
		ghost: cn(
			'border border-solid border-[var(--border-color)] bg-transparent',
			'hover:border-[var(--accent-hover)] focus:border-[var(--accent-default)]'
		),
		custom: '',
	},
	selectExt: {
		default: cn('bg-[var(--bg-tertiary)] ring-[var(--accent-default)]', 'hover:ring-1 focus:ring-1', 'ring-inset'),
		ghost: cn(
			'border border-solid border-[var(--border-color)] bg-transparent',
			'hover:border-[var(--accent-hover)] focus:border-[var(--accent-default)]'
		),
		custom: '',
	},
};
