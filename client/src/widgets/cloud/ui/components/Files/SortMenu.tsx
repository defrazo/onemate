import { useEffect, useRef, useState } from 'react';
import { IconArrowsSort, IconCheck } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

import type { CloudSort } from '../../../model';

const SORT_OPTIONS: { value: CloudSort; label: string }[] = [
	{ value: 'newest', label: 'Сначала новые' },
	{ value: 'oldest', label: 'Сначала старые' },
	{ value: 'name', label: 'По названию' },
	{ value: 'size', label: 'По размеру' },
];

export const SortMenu = observer(() => {
	const { cloudStore } = useStore();

	const [isOpen, setIsOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	const handleSelect = (value: CloudSort) => {
		cloudStore.setSortBy(value);
		setIsOpen(false);
	};

	useEffect(() => {
		if (!isOpen) return;

		const handlePointerDown = (event: PointerEvent) => {
			if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setIsOpen(false);
		};

		document.addEventListener('pointerdown', handlePointerDown);
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('pointerdown', handlePointerDown);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [isOpen]);

	return (
		<div ref={menuRef} className="relative">
			<Button
				aria-expanded={isOpen}
				aria-haspopup="menu"
				centerIcon={<IconArrowsSort className="size-4" />}
				className="p-1"
				disabled={cloudStore.isLoading}
				title="Сортировать файлы"
				variant="iconSurface"
				onClick={() => setIsOpen((prev) => !prev)}
			/>
			{isOpen && (
				<div className="absolute top-full left-0 z-50 mt-2 w-44 rounded-xl border border-(--border-primary) bg-(--bg-secondary) p-1.5 shadow-xl">
					{SORT_OPTIONS.map((option) => {
						const active = cloudStore.sortBy === option.value;

						return (
							<Button
								key={option.value}
								aria-checked={active}
								className={cn(
									'w-full text-sm hover:bg-(--tone-strong-hover)',
									active ? 'text-(--accent-primary)' : 'text-(--text-primary)'
								)}
								rightIcon={active && <IconCheck className="size-4 shrink-0" />}
								variant="custom"
								onClick={() => handleSelect(option.value)}
							>
								<span className="flex-1 text-left">{option.label}</span>
							</Button>
						);
					})}
				</div>
			)}
		</div>
	);
});
