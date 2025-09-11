import type { FC, ReactNode, SVGProps } from 'react';

export type Slide = {
	image: FC<SVGProps<SVGSVGElement>>;
	text: string;
};

export type TabOption = {
	value: string;
	label: ReactNode;
	disabled?: boolean;
};
