import { useEffect, useState } from 'react';

import { IconScroll } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/utils';
import { Divider } from '@/shared/ui';

interface Section {
	id: string;
	title: string;
}

const TableOfContents = () => {
	const [sections, setSections] = useState<Section[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);

	useEffect(() => {
		const headers = Array.from(document.querySelectorAll<HTMLHeadingElement>('h2[id]'));
		setSections(headers.map((h) => ({ id: h.id, title: h.textContent || 'Без названия' })));

		const handleScroll = () => {
			if (window.scrollY <= 1) {
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
		<nav className="group sticky top-1/2 -mr-4 hidden -translate-y-1/2 md:flex print:hidden">
			<div className="relative">
				<div className="flex cursor-pointer items-center justify-center rounded-full text-[var(--color-secondary)]">
					<IconScroll className="size-16 opacity-50" />
				</div>
				<div className="absolute top-1/2 left-0 z-10 hidden min-w-sm -translate-y-1/2 flex-col gap-1 rounded-xl bg-[var(--bg-secondary)] p-4 whitespace-nowrap shadow group-hover:flex">
					<h1 className="text-center text-xl font-bold select-none">Навигация</h1>
					<Divider />
					{sections.map((sec) => (
						<a
							key={sec.id}
							className={cn(
								'rounded-xl px-4 py-2 transition-colors',
								activeId === sec.id
									? 'border-l-4 border-[var(--accent-default)] bg-[var(--bg-tertiary)] font-semibold opacity-100 shadow'
									: 'border-transparent opacity-50 hover:bg-[var(--bg-tertiary)] hover:opacity-100'
							)}
							href={`#${sec.id}`}
							onClick={() =>
								document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
							}
						>
							{sec.title}
						</a>
					))}
					<Divider />
				</div>
			</div>
		</nav>
	);
};

export default TableOfContents;
