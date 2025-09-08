import type { FC, SVGProps } from 'react';

export type Slide = {
	image: FC<SVGProps<SVGSVGElement>>;
	text: string;
};
