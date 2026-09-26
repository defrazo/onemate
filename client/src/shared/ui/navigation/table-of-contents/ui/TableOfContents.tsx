import { useEffect, useState } from 'react';
import { IconListNumbers } from '@tabler/icons-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

export const TableOfContents = () => {
	const [sections, setSections] = useState<{ id: string; title: string }[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);

	useEffect(() => {
		const headers = Array.from(document.querySelectorAll<HTMLHeadingElement>('h2[id]'));
		setSections(headers.map(({ id, textContent }) => ({ id, title: textContent || 'Без названия' })));

		const handleScroll = () => {
			if (window.scrollY <= 1 && headers.length) {
				setActiveId(headers[0].id);
				return;
			}

			const middleY = window.innerHeight / 2;

			let closest: HTMLHeadingElement | null = null;
			let closestDistance = Infinity;

			headers.forEach((h) => {
				const rect = h.getBoundingClientRect();
				const distance = Math.abs(rect.top + rect.height / 2 - middleY);
				if (distance < closestDistance) {
					closestDistance = distance;
					closest = h;
				}
			});

			const atBottom =
				Math.ceil(window.scrollY + window.innerHeight) >= Math.ceil(document.documentElement.scrollHeight - 5);

			if (atBottom && headers.length) closest = headers[headers.length - 1];

			if (closest) setActiveId(closest.id);
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		handleScroll();

		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	return (
		<nav className="group sticky top-1/2 z-10 hidden -translate-y-1/2 select-none xl:block print:hidden">
			<div className="relative">
				<Button
					centerIcon={<IconListNumbers className="size-4.5" />}
					className="flex size-9 items-center justify-center rounded-lg border border-(--border-color) bg-(--bg-secondary) text-(--color-secondary) transition-colors hover:bg-(--bg-tertiary) hover:text-(--color-primary)"
					size="custom"
					title="Оглавление"
					variant="custom"
				/>
				<div className="invisible absolute top-1/2 left-11 w-72 -translate-y-1/2 rounded-xl border border-(--border-color) bg-(--bg-secondary) px-2 py-1 opacity-0 shadow-(--shadow) transition-[opacity,visibility] group-hover:visible group-hover:opacity-100">
					<div className="px-2.5 pt-1.5 pb-2">
						<span className="text-xs font-bold tracking-wide text-(--color-disabled)">Оглавление</span>
					</div>
					<div className="flex flex-col gap-0.5">
						{sections.map(({ id, title }) => {
							const active = activeId === id;

							return (
								<a
									key={id}
									className={cn(
										'relative rounded-lg px-3 py-2 text-sm transition-colors',
										active
											? 'bg-(--bg-tertiary) font-bold text-(--color-primary)'
											: 'text-(--color-secondary) hover:bg-(--bg-tertiary)/50 hover:text-(--color-primary)'
									)}
									href={`#${id}`}
								>
									{active && (
										<span className="absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-full bg-(--accent-default)" />
									)}
									<span className="block truncate">{title}</span>
								</a>
							);
						})}
					</div>
				</div>
			</div>
		</nav>
	);
};
