import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { History, SquarePen } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { cn, fullDate } from '@/shared/lib/utils';
import { Textarea } from '@/shared/ui';

import { NotesCardActions } from '.';

interface NotesCardProps {
	id: string;
}

export const NotesCard = observer(({ id }: NotesCardProps) => {
	const { notesStore: store } = useStore();
	const { attributes, listeners, transform, transition, isDragging, setNodeRef } = useSortable({ id });

	const draft = store.draft.find((note) => note.id === id);
	if (!draft) return null;

	const noteIndex = store.notes.findIndex((note) => note.id === id);

	return (
		<div
			ref={setNodeRef}
			className="core-border relative flex size-full bg-[var(--bg-secondary)] py-2"
			style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 0 }}
		>
			<div
				className={cn(
					'pointer-events-none w-12 items-center border-r border-[var(--border-color)] text-center text-[var(--color-disabled)] select-none',
					store.focusedId === id ? 'hidden' : 'flex'
				)}
			>
				<span className="w-full">{noteIndex + 1}</span>
			</div>
			<div className="flex flex-1 flex-col justify-between px-2">
				<Textarea
					className="hide-scrollbar h-full min-h-24 overscroll-contain pt-1 text-base"
					resize="none"
					rows={1}
					size="custom"
					value={draft.text}
					variant="custom"
					onBlur={() => store.setFocusedId(null)}
					onChange={(e) => store.updateNote(id, 'text', e.target.value)}
					onFocus={() => store.setFocusedId(id)}
				/>
				<div className="hidden cursor-help gap-2 text-xs leading-4 text-[var(--color-disabled)] xl:flex">
					<div className="flex items-center gap-1" title="Дата создания">
						<SquarePen className="size-3" /> {fullDate(draft.created_at)}
					</div>
					<div className="flex items-center gap-1" title="Дата последнего изменения">
						<History className="size-3" /> {fullDate(draft.updated_at)}
					</div>
				</div>
			</div>
			<NotesCardActions attributes={attributes} id={id} listeners={listeners} text={draft.text} />
		</div>
	);
});
