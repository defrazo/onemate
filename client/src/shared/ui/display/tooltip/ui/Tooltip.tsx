import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/shared/lib/utils';

import type { Placement } from '../model';
import { useTooltip } from '../model';

interface TooltipProps {
	content?: ReactNode;
	className?: string;
	children: ReactNode;
	preferredPlacements?: Placement[];
	offset?: number;
	portalContainer?: Element;
}

const Tooltip = ({
	content,
	className,
	children,
	preferredPlacements = ['top', 'bottom', 'right', 'left'],
	offset = 8,
	portalContainer,
}: TooltipProps) => {
	if (!content) return <>{children}</>;

	const { show, coords, placement, triggerRef, tipRef, setShow } = useTooltip(preferredPlacements, offset, content);

	const tip = (
		<div
			ref={tipRef}
			aria-hidden={!show}
			className="fixed z-100 hidden max-w-lg rounded-xl bg-black px-4 py-2 text-sm leading-snug text-(--accent-text) shadow transition-opacity xl:block"
			role="tooltip"
			style={{ top: coords.top, left: coords.left }}
		>
			<span
				className={cn(
					'pointer-events-none absolute block h-2 w-2 rotate-45 bg-black',
					(placement === 'top' || placement === 'bottom') && 'left-1/2 -translate-x-1/2',
					placement === 'top' && '-bottom-1',
					placement === 'bottom' && '-top-1',
					placement === 'left' && 'top-1/2 -right-1 -translate-y-1/2',
					placement === 'right' && 'top-1/2 -left-1 -translate-y-1/2'
				)}
			/>
			{content}
		</div>
	);

	return (
		<>
			<div
				ref={triggerRef}
				className={cn('inline-flex cursor-help', className)}
				tabIndex={0}
				onBlur={() => setShow(false)}
				onFocus={() => setShow(true)}
				onMouseEnter={() => setShow(true)}
				onMouseLeave={() => setShow(false)}
			>
				{children}
			</div>

			{show && createPortal(tip, portalContainer ?? document.body)}
		</>
	);
};

export default Tooltip;
