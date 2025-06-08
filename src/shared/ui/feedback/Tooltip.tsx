import { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

interface TooltipProps {
	text?: string;
	className?: string;
	children: ReactNode;
}

const Tooltip = ({ text, className, children }: TooltipProps) => {
	return (
		<div className={cn('relative inline-block cursor-help', className)}>
			{children}
			<div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden w-max -translate-x-1/2 transform rounded bg-black px-2 py-1 text-center text-base text-white group-hover:block">
				{text}
			</div>
		</div>
	);
};

export default Tooltip;
