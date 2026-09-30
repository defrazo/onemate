import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

import { type Placement, useTooltip } from '../model';

interface TooltipProps {
	content?: ReactNode;
	className?: string;
	children: ReactNode;
	preferredPlacements?: Placement[];
	offset?: number;
	portalContainer?: Element;
}

const DEFAULT_PLACEMENTS: Placement[] = ['top', 'bottom', 'right', 'left'];

interface TooltipContentProps extends Omit<TooltipProps, 'content'> {
	content: ReactNode;
}

const TooltipContent = ({
	content,
	className,
	children,
	preferredPlacements = DEFAULT_PLACEMENTS,
	offset = 8,
	portalContainer,
}: TooltipContentProps) => {
	const { show, coords, placement, triggerRef, tipRef, setShow } = useTooltip(preferredPlacements, offset, content);

	const tip = (
		<div
			ref={tipRef}
			aria-hidden={!show}
			className="fixed z-100 hidden max-w-sm rounded-lg border border-(--border-color) bg-(--bg-secondary) px-2.5 py-1.5 text-sm leading-snug text-(--color-primary) shadow-lg xl:block"
			role="tooltip"
			style={{ top: coords.top, left: coords.left }}
		>
			<span
				className={cn(
					'pointer-events-none absolute size-2 rotate-45 border-(--border-color) bg-(--bg-secondary)',
					(placement === 'top' || placement === 'bottom') && 'left-1/2 -translate-x-1/2',
					placement === 'top' && '-bottom-1 border-r border-b',
					placement === 'bottom' && '-top-1 border-t border-l',
					placement === 'left' && 'top-1/2 -right-1 -translate-y-1/2 border-t border-r',
					placement === 'right' && 'top-1/2 -left-1 -translate-y-1/2 border-b border-l'
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

export const Tooltip = ({ content, children, ...props }: TooltipProps) => {
	if (!content) return <>{children}</>;

	return (
		<TooltipContent {...props} content={content}>
			{children}
		</TooltipContent>
	);
};
