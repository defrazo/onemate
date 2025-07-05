import { ReactNode } from 'react';

export type NavItem = {
	to: string;
	icon: ReactNode;
	label: string;
	order?: number;
	onClick?: () => void;
};
