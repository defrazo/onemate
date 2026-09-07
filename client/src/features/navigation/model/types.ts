import type { ReactNode } from 'react';

export type NavItem = {
	to: string;
	icon: ReactNode;
	label: string;
	order: number;
	mobile?: boolean;
	external?: boolean;
	primaryMobile?: boolean;
};
