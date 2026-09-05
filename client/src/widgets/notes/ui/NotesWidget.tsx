import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { IconAdd } from '@/shared/assets/icons';
import { Button, Tooltip } from '@/shared/ui';

import { NOTES_TIP } from '../model';
import { NotesCard, NotesList } from '.';

const NotesWidget = () => {
	const { notesStore, notifyStore } = useStore();

	const handleAdd = () => {
		try {
			notesStore.addNote();
		} catch {
			notifyStore.setNotice('Не удалось добавить заметку', 'error');
		}
	};

	return (
		<>
			<div className="flex items-center">
				<Tooltip content={NOTES_TIP}>
					<h1 className="core-header">Заметки</h1>
				</Tooltip>
			</div>

			<div className="flex h-full flex-col justify-between gap-2 overflow-hidden md:max-h-full">
				<NotesList>{(item) => <NotesCard key={item.id} id={item.id} />}</NotesList>

				<div className="relative flex justify-center">
					<Button
						centerIcon={<IconAdd className="size-4" />}
						className="rounded-full p-2"
						size="custom"
						title="Добавить заметку"
						variant="accent"
						onClick={handleAdd}
					/>

					<div className="pointer-events-none absolute bottom-4 left-0 text-sm leading-0 text-(--color-disabled)">
						Всего записей: {notesStore.notes.length}
					</div>
				</div>
			</div>
		</>
	);
};

export default observer(NotesWidget);
