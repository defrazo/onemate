import type { JSX } from 'react';
import type { LucideIcon } from 'lucide-react';

export type CardItem = {
	title: string;
	desc: string;
	Icon: LucideIcon;
};

export type StackItem = {
	label: string;
	hint: string;
	svg: JSX.Element;
};
