import type { ReactNode } from 'react';

export type ListPlacement = 'start' | 'end';

export type SelectOption = {
	key?: string;
	value: string;
	label: string;
	icon?: string | ReactNode;
	disabled?: boolean;
};

export type Justify = 'start' | 'center' | 'end';

export type Direction = 'auto' | 'up' | 'down';
