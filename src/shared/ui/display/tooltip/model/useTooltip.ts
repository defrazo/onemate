import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { Placement } from '.';

const MARGIN = 8;

export const useTooltip = (preferredPlacements: Placement[], offset: number, content?: ReactNode) => {
	const [show, setShow] = useState<boolean>(false);
	const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
	const [placement, setPlacement] = useState<Placement>('top');

	const triggerRef = useRef<HTMLDivElement>(null);
	const tipRef = useRef<HTMLDivElement>(null);

	const updatePosition = () => {
		if (!triggerRef.current || !tipRef.current) return;

		const tRect = triggerRef.current.getBoundingClientRect();
		const tipRect = tipRef.current.getBoundingClientRect();

		const vw = window.innerWidth;
		const vh = window.innerHeight;

		const calc = {
			top: () => ({
				top: tRect.top - offset - tipRect.height,
				left: tRect.left + tRect.width / 2 - tipRect.width / 2,
			}),
			bottom: () => ({
				top: tRect.bottom + offset,
				left: tRect.left + tRect.width / 2 - tipRect.width / 2,
			}),
			left: () => ({
				top: tRect.top + tRect.height / 2 - tipRect.height / 2,
				left: tRect.left - offset - tipRect.width,
			}),
			right: () => ({
				top: tRect.top + tRect.height / 2 - tipRect.height / 2,
				left: tRect.right + offset,
			}),
		} as const;

		const fits = (position: { top: number; left: number }) => {
			return (
				position.left >= MARGIN &&
				position.top >= MARGIN &&
				position.left + tipRect.width <= vw - MARGIN &&
				position.top + tipRect.height <= vh - MARGIN
			);
		};

		for (const place of preferredPlacements) {
			const position = calc[place]();

			if (fits(position)) {
				setPlacement(place);
				setCoords(position);
				return;
			}
		}

		const fallback = {
			top: Math.min(
				Math.max(tRect.top + tRect.height / 2 - tipRect.height / 2, MARGIN),
				vh - tipRect.height - MARGIN
			),
			left: Math.min(
				Math.max(tRect.left + tRect.width / 2 - tipRect.width / 2, MARGIN),
				vw - tipRect.width - MARGIN
			),
		};

		setPlacement(preferredPlacements[0] ?? 'top');
		setCoords(fallback);
	};

	useLayoutEffect(() => {
		if (show) updatePosition();
	}, [show, content]);

	useEffect(() => {
		if (!show) return;

		const onScroll = () => updatePosition();
		const onResize = () => updatePosition();

		window.addEventListener('scroll', onScroll, true);
		window.addEventListener('resize', onResize);

		const observer = new ResizeObserver(() => updatePosition());
		if (triggerRef.current) observer.observe(triggerRef.current);
		if (tipRef.current) observer.observe(tipRef.current);

		return () => {
			window.removeEventListener('scroll', onScroll, true);
			window.removeEventListener('resize', onResize);
			observer.disconnect();
		};
	}, [show]);

	return { show, coords, placement, triggerRef, tipRef, setShow };
};
