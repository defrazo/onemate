import { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

interface ZoomOnHoverprops {
	children: ReactNode;
	scale?: number; //
	translate?: [number, number];
	className?: string;
}

const ZoomOnHover = ({ children, scale = 2, translate = [20, 20], className }: ZoomOnHoverprops) => {
	return (
		<div
			className={cn(
				'core-base z-50 rounded-xl transition-transform duration-300 hover:cursor-zoom-in',
				className
			)}
			style={{ width: '100%', height: 'auto', overflow: 'hidden', transformOrigin: 'top left' }}
			onMouseEnter={(e) =>
				(e.currentTarget.style.transform = `scale(${scale}) translate(${translate[0]}px, ${translate[1]}px)`)
			}
			onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
		>
			{children}
		</div>
	);
};

export default ZoomOnHover;
