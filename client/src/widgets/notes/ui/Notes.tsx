import { IconPlus } from '@tabler/icons-react';
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
		<div className="flex max-h-[40svh] min-h-0 flex-col gap-2 overflow-hidden xl:h-full">
			<List>{(note) => <Card key={note.id} id={note.id} />}</List>
			<div className="flex shrink-0 items-center justify-between">
				<div className="flex h-6 min-w-22.5 items-center justify-center gap-1 rounded-lg bg-(--accent-default)/10 px-2 text-sm text-(--accent-default)">
					<span>{notesStore.notes.length}</span>
					<span>{pluralize(notesStore.notes.length, 'заметка', 'заметки', 'заметок')}</span>
				</div>
				<Button
					centerIcon={<IconPlus className="size-4" />}
					className="h-6 min-w-22.5 rounded-lg text-sm"
					size="custom"
					title="Добавить заметку"
					variant="accent"
					onClick={handleAdd}
				/>
			</div>
		</div>
	);
});
