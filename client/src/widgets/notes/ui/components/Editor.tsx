import {
	IconArrowBackUp,
	IconArrowForwardUp,
	IconArrowLeft,
	IconCalendarPlus,
	IconCheck,
	IconClipboard,
	IconClockEdit,
	IconCopy,
	IconCut,
	IconEraser,
	IconSelectAll,
} from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { fullDate } from '@/shared/lib/utils';
import { Button, Textarea } from '@/shared/ui';

import { NOTE_MAX_LENGTH, useNoteEditor } from '../../model';
import { EditorAction } from '.';

export const Editor = observer(() => {
	const { notesStore } = useStore();
	const { textareaRef, feedback, undo, redo, cut, copy, paste, selectAll, clear } = useNoteEditor();

	const note = notesStore.activeNote;
	if (!note) return null;

	return (
		<div className="flex h-full min-h-0 flex-col">
			<div className="flex shrink-0 items-center justify-between border-b border-(--border-color) pb-2">
				<Button
					className="rounded-lg bg-white/5 px-2 py-1 text-xs text-(--color-secondary) hover:bg-white/6"
					leftIcon={<IconArrowLeft className="size-4" />}
					size="sm"
					title="Вернуться к заметкам"
					variant="mobile"
					onClick={() => notesStore.closeNote()}
				>
					Назад
				</Button>
				<div className="flex items-center justify-end gap-1.5">
					<EditorAction
						icon={feedback === 'undo' ? IconCheck : IconArrowBackUp}
						title="Отменить"
						onClick={undo}
					/>
					<EditorAction
						icon={feedback === 'redo' ? IconCheck : IconArrowForwardUp}
						title="Повторить"
						onClick={redo}
					/>
					<div className="mx-1 h-4 w-px bg-(--border-color)" />
					<EditorAction icon={feedback === 'cut' ? IconCheck : IconCut} title="Вырезать" onClick={cut} />
					<EditorAction
						icon={feedback === 'paste' ? IconCheck : IconClipboard}
						title="Вставить"
						onClick={paste}
					/>
					<EditorAction icon={feedback === 'copy' ? IconCheck : IconCopy} title="Копировать" onClick={copy} />
					<div className="mx-1 h-4 w-px bg-(--border-color)" />
					<EditorAction
						icon={feedback === 'select' ? IconCheck : IconSelectAll}
						title="Выделить всё"
						onClick={selectAll}
					/>
					<EditorAction
						icon={feedback === 'clear' ? IconCheck : IconEraser}
						title="Очистить"
						onClick={clear}
					/>
				</div>
			</div>
			<Textarea
				ref={textareaRef}
				autoFocus
				className="hide-scrollbar min-h-0 flex-1 py-2 text-base"
				maxLength={NOTE_MAX_LENGTH}
				name={`note-${note.id}`}
				resize="none"
				size="custom"
				value={note.text}
				variant="custom"
				onChange={(e) => notesStore.updateNote(note.id, 'text', e.target.value)}
			/>
			<div className="flex shrink-0 gap-3 pt-2 text-sm text-(--color-disabled) xl:-mb-1">
				<div className="hidden items-center gap-1 xl:flex" title="Дата создания">
					<IconCalendarPlus className="size-3.5" />
					{fullDate(note.created_at)}
				</div>
				<div className="flex items-center gap-1" title="Дата изменения">
					<IconClockEdit className="size-3.5" />
					{fullDate(note.updated_at)}
				</div>
				<div className="ml-auto flex items-center justify-center gap-1 rounded-lg bg-(--accent-default)/10 px-2 text-xs text-(--accent-default) tabular-nums">
					{note.text.length} / {NOTE_MAX_LENGTH} зн.
				</div>
			</div>
		</div>
	);
});
