import { useCallback, useEffect, useRef, useState } from 'react';
import { IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useOutsideClick } from '@/shared/lib/hooks';
import { pluralize } from '@/shared/lib/utils';
import { Button, Input, LoadingError, SyncIndicator } from '@/shared/ui';

import { Card, Editor, List } from './components';

export const Notes = observer(() => {
	const { notesStore, notifyStore } = useStore();

	const [searchOpen, setSearchOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');

	const inputRef = useRef<HTMLInputElement>(null);
	const searchRef = useOutsideClick<HTMLDivElement>(() => {
		setSearchQuery('');
		setSearchOpen(false);
	});

	const visibleNotes = notesStore.draft.filter((note) =>
		note.text.toLocaleLowerCase().includes(searchQuery.trim().toLocaleLowerCase())
	);

	const handleLoad = useCallback(() => {
		void notesStore.ensureLoaded().catch(() => notifyStore.setNotice('Не удалось загрузить заметки', 'error'));
	}, [notesStore, notifyStore]);

	useEffect(() => handleLoad(), [handleLoad]);

	useEffect(() => {
		if (searchOpen && !notesStore.activeNote) inputRef.current?.focus();
	}, [searchOpen, notesStore.activeNote]);

	const handleAdd = () => {
		try {
			const id = notesStore.addNote();
			notesStore.openNote(id);
		} catch {
			notifyStore.setNotice('Не удалось добавить заметку', 'error');
		}
	};

	const closeSearch = () => {
		setSearchQuery('');
		setSearchOpen(false);
	};

	if (!notesStore.isReady) return <LoadingError error={!!notesStore.error} size="lg" onRetry={handleLoad} />;

	if (notesStore.activeNote) {
		const note = notesStore.activeNote;
		return <Editor color={note.color} onColorChange={(color) => notesStore.updateNote(note.id, 'color', color)} />;
	}

	return (
		<div className="flex h-full min-h-0 flex-col justify-between gap-2 overflow-y-hidden">
			<List notes={visibleNotes} sortingDisabled={searchOpen}>
				{(note) => <Card key={note.id} color={note.color} id={note.id} sortingDisabled={searchOpen} />}
			</List>
			{searchOpen ? (
				<div ref={searchRef} className="flex shrink-0 items-center gap-1">
					<Input
						ref={inputRef}
						className="h-6 min-w-0 flex-1 text-sm"
						enterKeyHint="search"
						placeholder="Поиск заметок..."
						value={searchQuery}
						variant="tone"
						onChange={(event) => setSearchQuery(event.target.value)}
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
						<span className="trim">{notesStore.notes.length}</span>
						<span className="trim">
							{pluralize(notesStore.notes.length, 'заметка', 'заметки', 'заметок')}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<Button
							centerIcon={<IconSearch className="size-4" />}
							className="size-6"
							padding="none"
							title="Поиск заметок"
							variant="icon"
							onClick={() => setSearchOpen(true)}
						/>
						<Button
							centerIcon={<IconPlus className="size-4" />}
							className="h-6 min-w-22.5 text-sm"
							disabled={notesStore.isLoading}
							title="Добавить заметку"
							variant="accent"
							onClick={handleAdd}
						/>
					</div>
				</div>
			)}
			{notesStore.isSyncing && <SyncIndicator />}
		</div>
	);
});
