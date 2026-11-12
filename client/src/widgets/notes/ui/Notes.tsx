import { useEffect, useState } from 'react';
import { IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useCopy, useOutsideClick } from '@/shared/lib/hooks';
import { pluralize } from '@/shared/lib/utils';
import { Button, ConfirmDialog, Input, LoadingError, SyncIndicator } from '@/shared/ui';

import { Card, Editor, List } from './components';

export const Notes = observer(() => {
	const copy = useCopy();

	const { authStore, modalStore, notesStore: store, notifyStore, userStore } = useStore();

	const [searchOpen, setSearchOpen] = useState(false);
	const [query, setQuery] = useState('');

	const closeSearch = () => {
		setSearchOpen(false);
		setQuery('');
	};

	const searchRef = useOutsideClick<HTMLDivElement>(closeSearch);

	useEffect(() => {
		void store.ensureLoaded().catch(() => {});
	}, [store, userStore.id]);

	useEffect(() => {
		if (store.syncError) notifyStore.setNotice(store.syncError.message, 'error');
	}, [store.syncError, notifyStore]);

	const search = query.trim().toLocaleLowerCase();

	const visible = store.draft.filter((note) => note.text.toLocaleLowerCase().includes(search));

	const sortingDisabled = searchOpen || store.conflict || store.isLoading;

	const reload = () => {
		modalStore.setModal(
			<ConfirmDialog
				confirmLabel="Удалить черновик и загрузить"
				description="Несохранённые изменения этой вкладки будут удалены после успешной загрузки"
				title="Загрузить серверные заметки?"
				variant="danger"
				onCancel={modalStore.closeModal}
				onConfirm={() => {
					if (store.isLoading || store.saving) return;

					modalStore.closeModal();
					void store.loadServerVersion().catch(() => {});
				}}
			/>
		);
	};

	const showConflict = () => {
		modalStore.setModal(
			<ConfirmDialog
				cancelLabel="Загрузить с сервера"
				confirmLabel="Копировать черновик"
				description="Обнаружен конфликт версий. Скопируйте локальный черновик перед загрузкой серверных заметок."
				title="Конфликт версий заметок"
				onCancel={reload}
				onConfirm={() => void copy(store.getRecoveryText(), 'Черновик скопирован')}
			/>
		);
	};

	const addNote = () => {
		try {
			const id = store.addNote();
			store.openNote(id);
		} catch (error) {
			notifyStore.setNotice(error instanceof Error ? error.message : 'Не удалось добавить заметку', 'error');
		}
	};

	const syncStatus = store.saving ? (
		<SyncIndicator />
	) : store.conflict ? (
		<div className="flex shrink-0 flex-wrap items-center justify-between gap-2 text-xs">
			<span className="text-(--status-error)/80">Конфликт версий. Локальный черновик сохранён</span>
			<Button className="h-6 text-xs" onClick={showConflict}>
				Действия с черновиком
			</Button>
		</div>
	) : store.syncError ? (
		<div className="flex shrink-0 flex-wrap items-center justify-between gap-2 text-xs">
			<span className="text-(--status-error)/80">{store.syncError.message}</span>
			<Button
				className="h-6 text-xs"
				disabled={store.isLoading}
				onClick={() => void store.retry().catch(() => {})}
			>
				Повторить
			</Button>
		</div>
	) : null;

	if (!store.isReady)
		return (
			<LoadingError error={!!store.error} size="lg" onRetry={() => void store.ensureLoaded().catch(() => {})} />
		);

	return (
		<div className="flex h-full min-h-0 flex-1 flex-col gap-3 overflow-hidden" inert={authStore.isLoggingOut}>
			{store.activeNote ? (
				<Editor
					color={store.activeNote.color}
					onColorChange={(color) => store.updateNote(store.activeNote!.id, 'color', color)}
				/>
			) : (
				<>
					<List notes={visible} sortingDisabled={sortingDisabled}>
						{(note) => (
							<Card key={note.id} color={note.color} id={note.id} sortingDisabled={sortingDisabled} />
						)}
					</List>
					{searchOpen ? (
						<div ref={searchRef} className="flex shrink-0 items-center gap-1">
							<Input
								autoFocus
								className="h-6 min-w-0 flex-1 text-sm"
								enterKeyHint="search"
								placeholder="Поиск заметок..."
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
								<span className="trim">{store.notes.length}</span>
								<span className="trim">
									{pluralize(store.notes.length, 'заметка', 'заметки', 'заметок')}
								</span>
							</div>
							<div className="flex items-center gap-3">
								<Button
									centerIcon={<IconSearch className="size-4" />}
									padding="none"
									title="Поиск заметок"
									variant="icon"
									onClick={() => setSearchOpen(true)}
								/>
								<Button
									centerIcon={<IconPlus className="size-4" />}
									className="h-6 min-w-22.5"
									disabled={store.isLoading || store.conflict || store.draft.length >= 50}
									title="Добавить заметку"
									variant="accent"
									onClick={addNote}
								/>
							</div>
						</div>
					)}
				</>
			)}
			{syncStatus}
		</div>
	);
});
