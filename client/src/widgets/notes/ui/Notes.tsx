import { useCallback, useEffect } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { pluralize } from '@/shared/lib/utils';
import { Button, LoadingError, SyncIndicator } from '@/shared/ui';

import { Card, Editor, List } from './components';

export const Notes = observer(() => {
	const { notesStore, notifyStore } = useStore();

	const handleLoad = useCallback(() => {
		void notesStore.ensureLoaded().catch(() => notifyStore.setNotice('Не удалось загрузить заметки', 'error'));
	}, [notesStore, notifyStore]);

	useEffect(() => handleLoad(), [handleLoad]);

	const handleAdd = () => {
		try {
			const id = notesStore.addNote();
			notesStore.openNote(id);
		} catch {
			notifyStore.setNotice('Не удалось добавить заметку', 'error');
		}
	};

	if (!notesStore.isReady) return <LoadingError error={!!notesStore.error} size="lg" onRetry={handleLoad} />;

	if (notesStore.activeNote) {
		const note = notesStore.activeNote;
		return <Editor color={note.color} onColorChange={(color) => notesStore.updateNote(note.id, 'color', color)} />;
	}

	return (
		<div className="flex h-full min-h-0 flex-col justify-between gap-2 overflow-y-hidden">
			<List>{(note) => <Card key={note.id} color={note.color} id={note.id} />}</List>
			<div className="flex shrink-0 items-center justify-between">
				<div className="flex h-6 min-w-22.5 items-center justify-center gap-1 rounded-md bg-(--accent-primary-muted) px-2 text-sm text-(--accent-primary)">
					<span className="trim">{notesStore.notes.length}</span>
					<span className="trim">{pluralize(notesStore.notes.length, 'заметка', 'заметки', 'заметок')}</span>
				</div>
				<Button
					centerIcon={<IconPlus className="size-4" />}
					className="h-6 min-w-22.5 text-sm"
					disabled={notesStore.isLoading}
					title="Добавить заметку"
					variant="accent"
					onClick={handleAdd}
				/>
			</div>
			{notesStore.isSyncing && <SyncIndicator />}
		</div>
	);
});
