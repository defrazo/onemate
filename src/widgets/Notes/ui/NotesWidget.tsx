import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import { IconAdd } from '@/shared/assets/icons';
import { notesChannel } from '@/shared/lib/broadcast';
import { Button, Preloader } from '@/shared/ui';

import { notesStore } from '../model';
import { NotesCard, NotesList } from '.';

const NotesWidget = () => {
	useEffect(() => {
		const handleMessage = () => notesStore.loadNotes();

		notesChannel.onMessage(handleMessage);

		return () => notesChannel.offMessage(handleMessage);
	}, []);

	return (
		<div className="core-card core-base flex h-full flex-col gap-2 shadow-[var(--shadow)]">
			<h1 className="core-header">Заметки</h1>
			{notesStore.isLoading ? (
				<div className="flex flex-1 items-center justify-center">
					<Preloader className="size-25" />
				</div>
			) : (
				<div className="flex flex-1 flex-col justify-between">
					<NotesList>{(item) => <NotesCard key={item.id} id={item.id} />}</NotesList>
					<div className="relative flex justify-center">
						<Button
							centerIcon={<IconAdd className="size-4" />}
							className="rounded-full p-2"
							size="custom"
							title="Добавить заметку"
							onClick={() => notesStore.addNote()}
						/>
						<div className="pointer-events-none absolute bottom-4 left-0 text-sm leading-0 text-[var(--color-disabled)]">
							Всего записей: {notesStore.notes.length}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default observer(NotesWidget);
