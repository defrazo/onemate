import { cn } from '@/shared/lib/utils';

import type { Component } from '../model';

export const variants: Record<Component, Record<string, string>> = {
	button: {
		default: cn(
			'rounded-lg border border-(--border-contrast)',
			'bg-(--bg-tertiary) shadow-(--shadow-contrast)',
			'hover:bg-(--accent-primary-hover) hover:text-(--text-on-accent)'
		),
		ghost: cn(
			'rounded-lg border border-(--border-primary) bg-transparent',
			'hover:bg-(--tone) hover:text-(--text-primary)'
		),
		tone: cn(
			'rounded-lg bg-(--tone) text-(--text-primary) shadow-(--shadow-contrast)',
			'hover:bg-(--tone-hover) focus:text-(--text-primary)'
		),
		accent: cn(
			'rounded-lg bg-(--accent-primary) text-(--text-on-accent)/85',
			'hover:bg-(--accent-primary-hover)',
			'disabled:not-data-loading:bg-(--bg-tertiary)'
		),
		danger: cn(
			'rounded-lg border border-(--border-primary) bg-(--bg-tertiary)',
			'hover:border-transparent hover:bg-(--danger-hover) hover:text-(--text-on-accent)'
		),
		iconSurface: cn(
			'rounded-lg bg-transparent text-(--text-secondary)',
			'hover:bg-(--tone-strong) hover:text-(--accent-primary) active:scale-90'
		),
		icon: cn('text-(--text-secondary)', 'hover:text-(--accent-primary) active:scale-90'),
		custom: 'rounded-lg text-(--text-primary)',
	},
	input: {
		default: cn('border border-transparent bg-(--bg-tertiary)', 'hover:border-(--accent-primary-hover)/70'),
		ghost: cn('border border-(--border-primary) bg-transparent', 'hover:border-(--accent-primary-hover)/70'),
		tone: cn(
			'border border-transparent bg-(--tone) text-(--text-primary)',
			'hover:border-(--accent-primary-hover)/70 hover:bg-(--tone-hover)',
			'focus:text-(--text-primary)'
		),
		custom: '',
	},
	textarea: {
		default: cn('border border-transparent bg-(--bg-tertiary)', 'hover:border-(--accent-primary-hover)/70'),
		ghost: cn('border border-(--border-primary) bg-transparent', 'hover:border-(--accent-primary-hover)/70'),
	},
	checkbox: {
		default: '',
	},
	radio: {
		default: '',
		tone: cn('bg-(--tone)', 'hover:bg-(--tone-hover)'),
	},
	select: {
		default: cn('border border-transparent bg-(--bg-tertiary)', 'hover:border-(--accent-primary-hover)/70'),
		tone: cn(
			'border border-transparent bg-(--tone) text-(--text-primary)',
			'hover:border-(--accent-primary-hover)/70 hover:bg-(--tone-hover) focus:text-(--text-primary)'
		),
		custom: 'hover:text-(--accent-primary)',
	},
};
