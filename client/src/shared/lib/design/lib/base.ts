import { cn } from '@/shared/lib/utils';

import type { Component } from '../model';

export const base: Record<Component, string> = {
	button: cn(
		'flex items-center justify-center',
		'cursor-pointer select-none transition-colors',
		'focus-visible:ring-1 focus-visible:ring-(--accent-primary) focus-visible:outline-none',
		'disabled:pointer-events-none disabled:not-data-loading:opacity-50',
		'aria-disabled:pointer-events-none aria-disabled:opacity-50'
	),
	input: cn(
		'w-full rounded-lg not-lg:text-base',
		'transition-colors',
		'focus:border-(--accent-primary) focus:outline-none',
		'disabled:pointer-events-none disabled:opacity-50',
		'aria-invalid:border-(--status-error)'
	),
	textarea: cn(
		'w-full rounded-lg',
		'transition-colors',
		'focus:border-(--accent-primary) focus:outline-none',
		'disabled:pointer-events-none disabled:opacity-50',
		'aria-invalid:border-(--status-error)'
	),
	checkbox: cn('text-(--text-primary)'),
	radio: cn('border-(--border-primary)'),
	select: cn(
		'flex w-full items-center rounded-lg',
		'cursor-pointer text-nowrap transition-colors',
		'focus:border-(--accent-primary) focus:outline-none',
		'disabled:pointer-events-none disabled:opacity-50',
		'aria-invalid:border-(--status-error)'
	),
};
