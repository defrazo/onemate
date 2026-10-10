import { IconLoader2, IconPlus } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { pluralize } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

import { Card, Editor, List } from './components';

export const Notes = observer(() => {
	const { notesStore, notifyStore } = useStore();

	const handleAdd = () => {
		try {
			notesStore.addNote();
		} catch {
			notifyStore.setNotice('Не удалось добавить заметку', 'error');
		}
	};

	if (notesStore.activeNote) return <Editor />;

	return (
		<div className="flex h-full min-h-0 flex-col justify-between gap-2 overflow-y-hidden">
			<List>{(note) => <Card key={note.id} id={note.id} />}</List>
			<div className="flex shrink-0 items-center justify-between">
				<div className="flex h-6 min-w-22.5 items-center justify-center gap-1 rounded-md bg-(--accent-primary-muted) px-2 text-sm text-(--accent-primary)">
					<span>{notesStore.notes.length}</span>
					<span>{pluralize(notesStore.notes.length, 'заметка', 'заметки', 'заметок')}</span>
				</div>
				<Button
					centerIcon={
						!notesStore.isLoading ? (
							<IconPlus className="size-4" />
						) : (
							<IconLoader2 className="size-4 animate-spin" />
						)
					}
					className="h-6 min-w-22.5 text-sm"
					disabled={notesStore.isLoading}
					title="Добавить заметку"
					variant="accent"
					onClick={handleAdd}
				/>
			</div>
		</div>
	);
});
