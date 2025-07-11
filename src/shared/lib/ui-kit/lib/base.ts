import { cn } from '@/shared/lib/utils';

import type { Component } from '../model';

export const base: Record<Component, string> = {
	button: cn('flex items-center justify-center', 'transition-colors', 'cursor-pointer outline-none select-none'),
	input: cn('w-full', 'rounded-xl ', 'transition-colors', 'outline-none'),
	textarea: cn('w-full', 'rounded-xl ', 'transition-colors', 'outline-none'),
	checkbox: '',
	checkboxBool: '',
	radio: cn(
		'border-[var(--border-color)]',
		'transition-colors',
		'hover:enabled:border-[var(--accent-hover)] focus:enabled:border-[var(--accent-default)]',
		'cursor-pointer appearance-none outline-none'
	),
	select: cn('w-full', 'rounded-xl', 'transition-colors', 'cursor-pointer appearance-none outline-none'),
	selectExt: cn(
		'flex w-full items-center',
		'text-nowrap',
		'rounded-xl',
		'transition-colors',
		'cursor-pointer outline-none'
	),
};
