import { useEffect, useMemo, useRef } from 'react';

import { cn } from '@/shared/lib/utils';

import type { TabOption } from '../model';

interface TabSliderProps {
	tabs: TabOption[];
	value: string;
	className?: string;
	onChange: (value: string) => void;
}

export const TabSlider = ({ tabs, value, className, onChange }: TabSliderProps) => {
	const listRef = useRef<HTMLDivElement | null>(null);
	const sliderRef = useRef<HTMLDivElement | null>(null);
	const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
	const hasActive = useMemo(() => tabs.some((t) => t.value === value), [tabs, value]);

	const positionSlider = () => {
		const container = listRef.current;
		const slider = sliderRef.current;
		if (!container || !slider) return;

		const btn = tabRefs.current[value];

		if (!hasActive || !btn) {
			slider.style.left = '0px';
			slider.style.width = '0px';
			slider.style.height = `${container.clientHeight}px`;
			slider.style.opacity = '0';
			return;
		}

		const left = btn.offsetLeft;
		const width = btn.offsetWidth;
		const height = container.clientHeight;

		slider.style.left = `${left}px`;
		slider.style.width = `${width}px`;
		slider.style.height = `${height}px`;
		slider.style.opacity = '1';
	};

	useEffect(() => {
		const rerender = () => requestAnimationFrame(positionSlider);
		rerender();

		const onResize = () => rerender();
		window.addEventListener('resize', onResize);

		(document as any).fonts?.ready?.then(rerender);

		const ro = new ResizeObserver(rerender);
		if (listRef.current) ro.observe(listRef.current);
		const activeBtn = tabRefs.current[value];
		if (activeBtn) ro.observe(activeBtn);

		return () => {
			window.removeEventListener('resize', onResize);
			ro.disconnect();
		};
	}, [value, tabs.length, hasActive]);

	useEffect(() => {
		const id = requestAnimationFrame(positionSlider);
		return () => cancelAnimationFrame(id);
	}, [tabs, value, hasActive]);

	return (
		<div className={cn('flex', className)}>
			<div ref={listRef} className="relative flex items-center gap-1 py-1 whitespace-nowrap">
				<div
					ref={sliderRef}
					className="absolute top-0 left-0 z-0 rounded-xl bg-[var(--bg-tertiary)] shadow transition-[left,width,opacity] duration-300 ease-out"
					style={{ opacity: 0 }}
				/>
				{tabs.map((tab) => {
					const isActive = hasActive && tab.value === value;
					return (
						<button
							key={tab.value}
							ref={(el) => {
								tabRefs.current[tab.value] = el;
							}}
							aria-selected={isActive}
							className={cn(
								'group relative z-10 rounded-lg px-1.5 py-0.5 text-[var(--color-primary)] transition-opacity md:px-2.5 md:py-1',
								isActive ? 'font-semibold opacity-100' : hasActive ? 'opacity-80' : 'opacity-100',
								tab.disabled && 'cursor-not-allowed opacity-30'
							)}
							disabled={tab.disabled}
							onClick={() => !tab.disabled && onChange(tab.value)}
						>
							{tab.label}
						</button>
					);
				})}
			</div>
		</div>
	);
};
