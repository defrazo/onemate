import { IconAdd } from '@/shared/assets/icons';
import { Button, Preloader } from '@/shared/ui';

import { useNotes } from '../model';
import { NotesCard, NotesDashboard } from '.';

const NotesWidget = () => {
	const { notes, setNotes, focusedId, setFocusedId, loading, updateNotes, addNote, removeNote } = useNotes();

	return (
		<div className="core-card core-base flex h-full flex-col gap-2 shadow-[var(--shadow)]">
			<h1 className="core-header">Заметки</h1>
			{loading ? (
				<div className="flex flex-1 items-center justify-center">
					<Preloader className="size-25" />
				</div>
			) : (
				<>
					<NotesDashboard
						focusedId={focusedId}
						notes={notes}
						onOrderChange={(newNotes) => setNotes(newNotes)}
					>
						{(item) => (
							<NotesCard
								key={item.id}
								focusedId={focusedId}
								notes={notes}
								setFocusedId={setFocusedId}
								onChange={updateNotes}
								onRemove={removeNote}
								{...item}
							/>
						)}
					</NotesDashboard>
					<div className="relative flex justify-center">
						<Button
							centerIcon={<IconAdd className="size-4" />}
							className="rounded-full p-2"
							size="custom"
							onClick={() => addNote()}
						/>
						<div className="pointer-events-none absolute bottom-4 left-0 text-sm leading-0 text-[var(--color-disabled)]">
							Всего записей: {notes.length}
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default NotesWidget;
