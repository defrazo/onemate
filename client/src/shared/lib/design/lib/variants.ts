import { cn } from '@/shared/lib/utils';

import type { Component } from '../model';

export const variants: Record<Component, Record<string, string>> = {
	button: {
		default: cn(
			'rounded-xl ring-inset',
			'bg-(--bg-tertiary) ring-(--accent-primary)',
			'hover:bg-(--accent-primary-hover) hover:text-(--text-on-accent) focus-visible:ring-1'
		),
		ghost: cn(
			'rounded-xl border',
			'border-(--border-primary) bg-transparent',
			'hover:bg-white/5 hover:text-(--bg-accent-text) focus-visible:border-(--accent-primary)'
		),
		accent: cn(
			'rounded-xl border ring-inset',
			'border-(--border-contrast) bg-(--accent-primary) disabled:bg-(--bg-tertiary) text-(--text-on-accent) ring-(--text-primary)',
			'hover:bg-(--accent-primary-hover) hover:text-(--text-on-accent) focus-visible:ring-1'
		),
		rounded: cn(
			'aspect-square w-fit rounded-full p-2 ring-inset',
			'bg-(--bg-tertiary) text-(--text-on-accent) ring-(--text-primary)',
			'hover:bg-(--accent-primary-hover) hover:text-(--text-on-accent) focus-visible:ring-1'
		),
		warning: cn(
			'rounded-xl border',
			'border-(--border-primary) bg-(--bg-tertiary)',
			'hover:border-(--status-error) hover:bg-(--status-error) hover:text-(--text-on-accent)'
		),
		mobile: 'bg-transparent text-(--text-primary)',
		custom: '',
	},
	input: {
		default: cn('ring-inset', 'bg-(--bg-tertiary) ring-(--accent-primary)', 'focus:ring-1 hover:enabled:ring-1'),
		ghost: cn(
			'border',
			'border-(--border-primary) bg-transparent',
			'hover:border-(--accent-primary-hover) focus:border-(--accent-primary)'
		),
		custom: '',
	},
	textarea: {
		default: cn('ring-inset', 'bg-(--bg-tertiary) ring-(--accent-primary)', 'hover:ring-1 focus:ring-1'),
		ghost: cn(
			'border',
			'border-(--border-primary) bg-transparent',
			'hover:border-(--accent-primary-hover) focus:border-(--accent-primary)'
		),
		custom: '',
	},
	checkbox: { default: '' },
	radio: { default: 'border-(--border-primary)', custom: '' },
	select: {
		default: cn('ring-inset', 'bg-(--bg-tertiary) ring-(--accent-primary)', 'hover:ring-1 focus:ring-1'),
		embedded: cn(
			'border',
			'border-(--border-primary) bg-transparent',
			'hover:border-(--accent-primary-hover)/50 focus:border-(--accent-primary)/50'
		),
		detached: '',
		custom: '',
	},
};
