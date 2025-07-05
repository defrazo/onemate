import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Textarea } from '@/shared/ui';

import type { Note } from '../model';
import { NotesCardActions } from '.';

interface NotesCardProps {
	id: string;
	text: string;
	notes: Note[];
	focusedId: string | null;
	setFocusedId: React.Dispatch<React.SetStateAction<string | null>>;
	onChange: <K extends keyof Note>(index: string, key: K, value: Note[K]) => void;
	onRemove: (id: string) => void;
}

export const NotesCard = ({ id, text, notes, focusedId, setFocusedId, onChange, onRemove }: NotesCardProps) => {
	const { attributes, listeners, transform, transition, setNodeRef } = useSortable({ id });
	const note = notes.findIndex((item) => item.id === id) + 1;

	return (
		<div
			ref={setNodeRef}
			className="core-border flex size-full rounded-xl bg-[var(--bg-secondary)] py-2 text-sm"
			style={{ transform: CSS.Transform.toString(transform), transition }}
		>
			<div className="pointer-events-none flex w-12 items-center border-r border-[var(--border-color)] text-[var(--color-disabled)] select-none">
				<span className="w-full text-center">{note}</span>
			</div>
			<Textarea
				className="min-h-18 p-2 text-sm"
				resize="none"
				rows={1}
				size="custom"
				value={text}
				variant="custom"
				onBlur={() => setFocusedId(null)}
				onChange={(e) => onChange(id, 'text', e.target.value)}
				onFocus={() => setFocusedId(id)}
			/>
			<NotesCardActions
				attributes={attributes}
				focused={!!focusedId}
				listeners={listeners}
				text={text}
				onRemove={() => onRemove(id)}
			/>
		</div>
	);
};
