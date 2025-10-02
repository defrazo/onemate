import { cn } from '@/shared/lib/utils';

import type { Component } from '../model';

export const variants: Record<Component, Record<string, string>> = {
	button: {
		default: cn(
			'rounded-xl ring-inset',
			'bg-[var(--bg-tertiary)] ring-[var(--accent-default)]',
			'hover:bg-[var(--accent-hover)] hover:text-[var(--accent-text)] focus-visible:ring-1'
		),
		ghost: cn(
			'rounded-xl border border-solid',
			'border-[var(--border-color)] bg-transparent',
			'hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)] hover:text-[var(--bg-accent-text)] focus-visible:border-[var(--accent-default)]'
		),
		accent: cn(
			'rounded-xl border border-solid ring-inset',
			'border-[var(--border-light)] bg-[var(--accent-default)] text-[var(--accent-text)] ring-[var(--color-primary)]',
			'hover:bg-[var(--accent-hover)] hover:text-[var(--accent-text)] focus-visible:ring-1'
		),
		rounded: cn(
			'aspect-square w-fit rounded-full p-2 ring-inset',
			'bg-[var(--bg-tertiary)] text-[var(--accent-text)] ring-[var(--color-primary)]',
			'hover:bg-[var(--accent-hover)] hover:text-[var(--accent-text)] focus-visible:ring-1'
		),
		warning: cn(
			'rounded-xl border border-solid',
			'border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--color-disabled)]',
			'hover:border-[var(--status-error)] hover:bg-[var(--status-error)] hover:text-[var(--accent-text)]'
		),
		mobile: 'bg-transparent text-[var(--color-primary)]',
		custom: '',
	},
	input: {
		default: cn(
			'ring-inset',
			'bg-[var(--bg-tertiary)] ring-[var(--accent-default)]',
			'focus:ring-1 hover:enabled:ring-1'
		),
		ghost: cn(
			'border border-solid',
			'border-[var(--border-color)] bg-transparent',
			'hover:border-[var(--accent-hover)] focus:border-[var(--accent-default)]'
		),
		custom: '',
	},
	textarea: {
		default: cn('ring-inset', 'bg-[var(--bg-tertiary)] ring-[var(--accent-default)]', 'hover:ring-1 focus:ring-1'),
		ghost: cn(
			'border border-solid',
			'border-[var(--border-color)] bg-transparent',
			'hover:border-[var(--accent-hover)] focus:border-[var(--accent-default)]'
		),
		custom: '',
	},
	checkbox: { default: '' },
	checkboxBool: { default: '' },
	radio: { default: 'border-[var(--border-color)]', custom: '' },
	select: {
		default: cn('ring-inset', 'bg-[var(--bg-tertiary)] ring-[var(--accent-default)]', 'hover:ring-1 focus:ring-1'),
		ghost: cn(
			'border border-solid',
			'border-[var(--border-color)] bg-transparent',
			'hover:border-[var(--accent-hover)] focus:border-[var(--accent-default)]'
		),
		custom: '',
	},
	selectExt: {
		default: cn('ring-inset', 'bg-[var(--bg-tertiary)] ring-[var(--accent-default)]', 'hover:ring-1 focus:ring-1'),
		embedded: cn(
			'border border-solid',
			'border-[var(--border-color)] bg-transparent',
			'hover:border-[var(--accent-hover-op)] focus:border-[var(--accent-default-op)]'
		),
		detached: '',
		custom: '',
	},
};
