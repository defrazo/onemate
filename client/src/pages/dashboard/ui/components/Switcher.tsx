import { useEffect, useRef } from 'react';

import { EMPTY_WIDGET_SLOT, type WidgetId, type WidgetSlot } from '@/shared/config';
import { cn } from '@/shared/lib/utils';

import type { SwitcherOption } from '../../model';

interface SwitcherProps {
	options: SwitcherOption[];
	value: WidgetSlot;
	onChange: (value: WidgetId) => void;
	className?: string;
}

export const Switcher = ({ options, value, onChange, className }: SwitcherProps) => {
	const listRef = useRef<HTMLDivElement>(null);
	const switcherRef = useRef<HTMLDivElement>(null);
	const optionRefs = useRef<Partial<Record<WidgetId, HTMLButtonElement | null>>>({});

	useEffect(() => {
		const list = listRef.current;
		const switcher = switcherRef.current;

		if (!list || !switcher) return;

		let frameId = 0;

		const positionSwitcher = () => {
			const activeOption = value === EMPTY_WIDGET_SLOT ? null : optionRefs.current[value];

			if (!activeOption) {
				switcher.style.width = '0px';
				switcher.style.opacity = '0';
				return;
			}

			switcher.style.transform = `translateX(${activeOption.offsetLeft}px)`;
			switcher.style.width = `${activeOption.offsetWidth}px`;
			switcher.style.height = `${list.clientHeight}px`;
			switcher.style.opacity = '1';
		};

		const update = () => {
			cancelAnimationFrame(frameId);
			frameId = requestAnimationFrame(positionSwitcher);
		};

		const observer = new ResizeObserver(update);
		observer.observe(list);

		const activeOption = value === EMPTY_WIDGET_SLOT ? null : optionRefs.current[value];
		if (activeOption) observer.observe(activeOption);

		update();

		return () => {
			cancelAnimationFrame(frameId);
			observer.disconnect();
		};
	}, [options, value]);

	return (
		<div className={cn('flex', className)}>
			<div
				ref={listRef}
				className="relative flex flex-1 items-center justify-between gap-1 py-1 whitespace-nowrap"
			>
				<div
					ref={switcherRef}
					className="absolute top-0 left-0 z-0 rounded-xl bg-(--accent-default)/10 transition-[transform,width,opacity] duration-300 ease-out"
					style={{ opacity: 0 }}
				/>
				{options.map((option) => {
					const isActive = option.value === value;

					return (
						<button
							key={option.value}
							ref={(element) => {
								optionRefs.current[option.value] = element;
							}}
							className={cn(
								'group relative z-10 rounded-lg px-1.5 py-0.5 transition-colors',
								isActive ? 'text-(--accent-default)' : 'text-(--color-secondary)'
							)}
							role="tab"
							type="button"
							onClick={() => onChange(option.value)}
						>
							{option.label}
						</button>
					);
				})}
			</div>
		</div>
	);
};
