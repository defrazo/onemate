import { useEffect, useRef } from 'react';

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

	const positionSlider = () => {
		const container = listRef.current;
		const slider = sliderRef.current;
		const btn = tabRefs.current[value];
		if (!container || !slider || !btn) return;

		const containerRect = container.getBoundingClientRect();
		const buttonRect = btn.getBoundingClientRect();

		const left = buttonRect.left - containerRect.left + container.scrollLeft;
		slider.style.transform = `translateX(${left}px)`;
		slider.style.width = `${buttonRect.width}px`;
	};

	useEffect(() => positionSlider(), [value, tabs]);

	return (
		<div className={cn('flex', className)}>
			<div ref={listRef} className="relative flex items-center gap-1 py-1">
				<div
					ref={sliderRef}
					className="absolute inset-0 z-0 rounded-xl bg-[var(--bg-tertiary)] shadow transition-[transform,width] duration-300 ease-out"
				/>
				{tabs.map((tab) => (
					<button
						key={tab.value}
						ref={(element) => {
							tabRefs.current[tab.value] = element;
						}}
						className={cn(
							'group relative z-10 rounded-xl px-2.5 py-1 text-[var(--color-primary)]',
							tab.value === value ? 'font-semibold opacity-100' : 'opacity-50',
							tab.disabled && 'opacity-10'
						)}
						onClick={() => !tab.disabled && onChange(tab.value)}
					>
						{tab.label}
					</button>
				))}
			</div>
		</div>
	);
};
