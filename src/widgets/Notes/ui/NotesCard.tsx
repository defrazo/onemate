import { useEffect, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { History, SquarePen } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import { fullDate } from '@/shared/lib/utils';
import { Textarea } from '@/shared/ui';

import { notesStore } from '../model';
import { NotesCardActions } from '.';

interface NotesCardProps {
	id: string;
}

export const NotesCard = observer(({ id }: NotesCardProps) => {
	const { attributes, listeners, transform, transition, isDragging, setNodeRef } = useSortable({ id });

	const store = notesStore;
	const note = store.notes.find((note) => note.id === id);
	if (!note) return null;

	const noteIndex = store.notes.findIndex((note) => note.id === id);

	const [draft, setDraft] = useState<string>(note?.text ?? '');

	useEffect(() => {
		if (draft !== note?.text) setDraft(note?.text || '');
	}, [note?.text]);

	return (
		<div
			ref={setNodeRef}
			className="core-border relative flex size-full rounded-xl bg-[var(--bg-secondary)] py-2 text-sm"
			style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 0 }}
		>
			<div className="pointer-events-none flex w-12 items-center border-r border-[var(--border-color)] text-center text-[var(--color-disabled)] select-none">
				<span className="w-full">{noteIndex + 1}</span>
			</div>
			<div className="flex flex-1 flex-col justify-between px-2">
				<Textarea
					className="min-h-27 pt-1 text-sm"
					resize="none"
					rows={1}
					size="custom"
					value={draft}
					variant="custom"
					onBlur={() => {
						if (draft !== note?.text) store.updateNote(id, 'text', draft);
						store.setFocusedId(null);
					}}
					onChange={(e) => setDraft(e.target.value)}
					onFocus={() => store.setFocusedId(id)}
				/>
				<div className="flex cursor-help gap-2 text-xs leading-4 text-[var(--color-disabled)]">
					<div className="flex items-center gap-1" title="Дата создания">
						<SquarePen className="size-3" /> {note ? fullDate(note.created_at) : '—'}
					</div>
					<div className="flex items-center gap-1" title="Дата последнего изменения">
						<History className="size-3" /> {note ? fullDate(note.updated_at) : '—'}
					</div>
				</div>
			</div>
			<NotesCardActions attributes={attributes} id={id} listeners={listeners} text={draft} />
		</div>
	);
});
