import { useEffect, useRef, useState } from 'react';
import { IconListSearch } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import type { TodoList } from '@/entities/todo';
import { NoContent } from '@/shared/ui';

import { AddItem } from './AddItem';
import { ItemRow } from './ItemRow';
import { Progress } from './Progress';

export const ListContent = observer(({ list }: { list: TodoList }) => {
	const [activeActionsId, setActiveActionsId] = useState<string | null>(null);

	const listRef = useRef<HTMLUListElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);

	const completed = list.items.filter((item) => item.is_completed).length;
	const items = [...list.items].sort((a, b) => a.position - b.position);

	const scrollToBottom = () => {
		requestAnimationFrame(() => {
			scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
		});
	};

	const handleActionsToggle = (id: string) => setActiveActionsId((prev) => (prev === id ? null : id));

	const handleActionsClose = () => setActiveActionsId(null);

	useEffect(() => {
		if (!activeActionsId) return;

		const handlePointerDown = (event: PointerEvent) => {
			const target = event.target;
			if (!(target instanceof Node)) return;

			const activeRow = Array.from(listRef.current?.children ?? []).find(
				(element) => element.getAttribute('data-item-id') === activeActionsId
			);

			if (!activeRow?.contains(target)) setActiveActionsId(null);
		};

		document.addEventListener('pointerdown', handlePointerDown);

		return () => document.removeEventListener('pointerdown', handlePointerDown);
	}, [activeActionsId]);

	return (
		<>
			<div ref={scrollRef} className="min-h-0 flex-1 scrollbar-none overflow-y-auto overscroll-contain">
				{list.items.length ? (
					<ul ref={listRef} className="flex shrink-0 flex-col gap-0.5">
						{items.map((item) => (
							<ItemRow
								key={item.id}
								actionsOpen={activeActionsId === item.id}
								item={item}
								onActionsClose={handleActionsClose}
								onActionsToggle={() => handleActionsToggle(item.id)}
							/>
						))}
					</ul>
				) : (
					<NoContent
						description="Добавьте первый пункт, чтобы начать список"
						icon={IconListSearch}
						title="Список пуст"
					/>
				)}
			</div>
			<AddItem list={list} onAdded={scrollToBottom} />
			<Progress completed={completed} total={list.items.length} />
		</>
	);
});
