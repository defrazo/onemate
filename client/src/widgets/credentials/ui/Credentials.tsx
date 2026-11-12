import { useEffect, useState } from 'react';
import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { IconKey, IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useOutsideClick } from '@/shared/lib/hooks';
import { pluralize } from '@/shared/lib/utils';
import { Button, ConfirmDialog, Input, LoadingError, NoContent, SyncIndicator } from '@/shared/ui';

import { CREDENTIAL_LIMIT } from '../model/constants';
import { Card, Editor } from './components';

export const Credentials = observer(() => {
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
	);

	const { authStore, credentialsStore: store, modalStore, notifyStore, userStore } = useStore();

	const [searchOpen, setSearchOpen] = useState(false);
	const [query, setQuery] = useState('');

	const closeSearch = () => {
		setSearchOpen(false);
		setQuery('');
	};

	const searchRef = useOutsideClick<HTMLDivElement>(closeSearch);

	useEffect(() => {
		void store.ensureLoaded();

		return store.cancelOpening;
	}, [store, userStore.id, userStore.userRole]);

	useEffect(() => {
		if (store.error) notifyStore.setNotice(store.error.message, 'error');
	}, [store.error, notifyStore]);

	const search = query.trim().toLocaleLowerCase();

	const visible = store.entries.filter((entry) =>
		[entry.service, entry.login, entry.url].some((value) => value.toLocaleLowerCase().includes(search))
	);

	const disabled = store.isLoading || store.conflict;
	const sortingDisabled = store.conflict || (store.isLoading && !store.reordering) || searchOpen;
	const limitReached = store.entries.length >= CREDENTIAL_LIMIT;

	const reload = () => {
		modalStore.setModal(
			<ConfirmDialog
				confirmLabel="Удалить черновик и загрузить"
				description="Локальный черновик будет удалён. Сохраните его с помощью «Копировать всё» в редакторе."
				title="Загрузить серверные аккаунты?"
				onCancel={modalStore.closeModal}
				onConfirm={() => {
					if (store.isLoading) return;

					modalStore.closeModal();
					void store.reload();
				}}
			/>
		);
	};

	const reorder = ({ active, over }: DragEndEvent) => {
		if (sortingDisabled || !over || active.id === over.id) return;

		const from = store.entries.findIndex((entry) => entry.id === active.id);
		const to = store.entries.findIndex((entry) => entry.id === over.id);

		if (from < 0 || to < 0) return;

		const ids = arrayMove(store.entries, from, to).map((entry) => entry.id);

		void store.reorder(ids);
	};

	if (!store.isReady)
		return <LoadingError error={!!store.error} size="lg" onRetry={() => void store.ensureLoaded()} />;

	return (
		<div className="flex h-full min-h-0 flex-1 flex-col gap-3 overflow-hidden" inert={authStore.isLoggingOut}>
			{store.draft ? (
				<Editor key={store.editingId ?? 'new'} />
			) : (
				<>
					<DndContext
						collisionDetection={closestCenter}
						modifiers={[restrictToParentElement]}
						sensors={sensors}
						onDragEnd={reorder}
					>
						<SortableContext
							items={visible.map((entry) => entry.id)}
							strategy={verticalListSortingStrategy}
						>
							<div className="flex min-h-0 flex-1 scrollbar-none flex-col gap-2 overflow-y-auto md:gap-3">
								{visible.map((entry) => (
									<Card
										key={entry.id}
										disabled={disabled}
										entry={entry}
										sortingDisabled={sortingDisabled}
									/>
								))}
								{visible.length === 0 && (
									<NoContent
										description={
											search
												? 'Попробуйте изменить поисковый запрос'
												: 'Нажмите +, чтобы добавить аккаунт'
										}
										icon={IconKey}
										title={search ? 'Ничего не найдено' : 'Пока нет аккаунтов'}
									/>
								)}
							</div>
						</SortableContext>
					</DndContext>
					{searchOpen ? (
						<div ref={searchRef} className="flex shrink-0 items-center gap-1">
							<Input
								autoFocus
								className="h-6 min-w-0 flex-1 text-sm"
								placeholder="Поиск аккаунтов..."
								value={query}
								variant="tone"
								onChange={(event) => setQuery(event.target.value)}
								onKeyDown={(event) => {
									if (event.key === 'Escape') closeSearch();
								}}
							/>
							<Button
								centerIcon={<IconX className="size-4" />}
								className="size-6 shrink-0"
								padding="none"
								title="Закрыть поиск"
								variant="icon"
								onClick={closeSearch}
							/>
						</div>
					) : (
						<div className="flex shrink-0 items-center justify-between">
							<div className="flex h-6 min-w-22.5 items-center justify-center gap-1 rounded-md bg-(--accent-primary-muted) px-2 text-sm text-(--accent-primary)">
								<span className="trim">{store.entries.length}</span>
								<span className="trim">
									{pluralize(store.entries.length, 'аккаунт', 'аккаунта', 'аккаунтов')}
								</span>
							</div>
							<div className="flex items-center gap-3">
								<Button
									centerIcon={<IconSearch className="size-4" />}
									padding="none"
									title="Поиск аккаунтов"
									variant="icon"
									onClick={() => setSearchOpen(true)}
								/>
								<Button
									centerIcon={<IconPlus className="size-4" />}
									className="h-6 min-w-22.5"
									disabled={disabled || limitReached}
									title={
										limitReached
											? `Достигнут лимит ${CREDENTIAL_LIMIT} аккаунтов`
											: 'Добавить аккаунт'
									}
									variant="accent"
									onClick={() => store.addAccount()}
								/>
							</div>
						</div>
					)}
				</>
			)}
			{store.isLoading && <SyncIndicator />}
			{store.error && (
				<div className="flex shrink-0 flex-wrap items-center justify-between gap-2 text-xs">
					<span className="text-(--status-error)/80">{store.error.message}</span>
					{store.conflict ? (
						<Button className="h-6 text-xs" onClick={reload}>
							Загрузить с сервера
						</Button>
					) : store.draft ? (
						<Button
							className="h-6 text-xs"
							disabled={store.isLoading}
							onClick={() => void store.closeEditor()}
						>
							Повторить сохранение
						</Button>
					) : (
						<Button className="h-6 text-xs" disabled={store.isLoading} onClick={() => void store.reload()}>
							Обновить
						</Button>
					)}
				</div>
			)}
		</div>
	);
});
