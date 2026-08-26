import { cn } from '@/shared/lib/utils';

import type { Component } from '../model';

export const base: Record<Component, string> = {
	button: cn('flex items-center justify-center', 'cursor-pointer transition-colors outline-none select-none'),
	input: cn('w-full rounded-xl', 'transition-colors outline-none'),
	textarea: cn('w-full rounded-xl', 'transition-colors outline-none'),
	checkbox: '',
	checkboxBool: '',
	radio: 'cursor-pointer appearance-none transition-colors outline-none',
	select: cn('w-full rounded-xl', 'cursor-pointer appearance-none transition-colors outline-none'),
	selectExt: cn('flex w-full items-center rounded-xl', 'cursor-pointer text-nowrap transition-colors outline-none'),
};
