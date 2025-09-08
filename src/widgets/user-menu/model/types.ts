import type { MouseEvent, ReactElement, ReactNode } from 'react';

export type UserButton = {
	id: string;
	icon?: ReactElement;
	leftIcon?: ReactNode;
	to?: string;
	action?: (e: MouseEvent<HTMLButtonElement>) => void;
	label: ReactNode;
};
