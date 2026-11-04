import { useState } from 'react';
import {
	IconArrowBackUp,
	IconArrowForwardUp,
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
import { COLOR_PALETTE, type PaletteColor } from '@/shared/config';
import { useOutsideClick, useTextEditor } from '@/shared/lib/hooks';
import { cn, fullDate } from '@/shared/lib/utils';
import { BackButton, Divider, EditorAction, Textarea } from '@/shared/ui';

import { NOTE_MAX_LENGTH } from '../../model';

interface EditorProps {
	color: PaletteColor;
	onColorChange: (color: PaletteColor) => void;
}

export const Editor = observer(({ color, onColorChange }: EditorProps) => {
	const { notesStore } = useStore();
	const { textareaRef, feedback, undo, redo, cut, copy, paste, selectAll, clear } = useTextEditor(NOTE_MAX_LENGTH);

	const [paletteOpen, setPaletteOpen] = useState(false);

	const paletteRef = useOutsideClick<HTMLDivElement>(() => setPaletteOpen(false));

	const note = notesStore.activeNote;
	if (!note) return null;

	return (
		<div className="flex h-full min-h-0 flex-col">
			<div className="flex shrink-0 flex-col gap-2 border-b border-(--border-primary) pb-2 xl:flex-row xl:items-center xl:justify-between">
				<BackButton className="mr-auto" title="Вернуться к заметкам" onClick={() => notesStore.closeNote()} />
				<div className="flex items-center justify-between md:gap-1 xl:ml-auto xl:justify-end">
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
					<Divider className="my-auto h-4" direction="Y" margX="sm" />
					<EditorAction icon={feedback === 'cut' ? IconCheck : IconCut} title="Вырезать" onClick={cut} />
					<EditorAction
						icon={feedback === 'paste' ? IconCheck : IconClipboard}
						title="Вставить"
						onClick={paste}
					/>
					<EditorAction icon={feedback === 'copy' ? IconCheck : IconCopy} title="Копировать" onClick={copy} />
					<Divider className="my-auto h-4" direction="Y" margX="sm" />
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
					<Divider className="my-auto h-4" direction="Y" margX="sm" />
					<div className="relative">
						<button
							aria-expanded={paletteOpen}
							aria-label="Цвет заметки"
							className="flex size-8 cursor-pointer items-center justify-center rounded-md hover:bg-(--tone-hover)"
							title="Цвет заметки"
							type="button"
							onClick={() => setPaletteOpen((current) => !current)}
						>
							<span
								className="size-3.5 rounded-full"
								style={{ backgroundColor: COLOR_PALETTE[color].value }}
							/>
						</button>
						{paletteOpen && (
							<div
								ref={paletteRef}
								className="absolute top-full right-0 z-30 mt-0.5 grid w-max grid-cols-4 gap-2 rounded-lg border border-(--border-primary) bg-(--bg-secondary) p-3 shadow-lg"
							>
								{Object.entries(COLOR_PALETTE).map(([key, config]) => (
									<button
										key={key}
										aria-label={config.label}
										aria-pressed={color === key}
										className={cn(
											'flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-(--tone-hover)',
											color === key && 'bg-(--tone-hover)'
										)}
										title={config.label}
										type="button"
										onClick={() => {
											onColorChange(key as PaletteColor);
											setPaletteOpen(false);
										}}
									>
										<span
											className="size-4 rounded-full"
											style={{ backgroundColor: config.value }}
										/>
									</button>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
			<Textarea
				ref={textareaRef}
				autoFocus
				className="min-h-0 flex-1 scrollbar-none px-0 py-2 text-base"
				maxLength={NOTE_MAX_LENGTH}
				name={`note-${note.id}`}
				resize="none"
				value={note.text}
				variant="custom"
				onChange={(e) => notesStore.updateNote(note.id, 'text', e.target.value)}
			/>
			<div className="core-gap flex shrink-0 items-end pt-2 text-xs text-(--text-disabled) lg:text-sm xl:-mb-1">
				<div className="hidden items-center gap-1 lg:flex" title="Дата создания">
					<IconCalendarPlus className="size-3.5" />
					<span className="trim">{fullDate(note.created_at)}</span>
				</div>
				<div className="flex items-center gap-1" title="Дата изменения">
					<IconClockEdit className="size-3.5" />
					<span className="trim">{fullDate(note.updated_at)}</span>
				</div>
				<div className="ml-auto flex items-center justify-center gap-1 rounded-md bg-(--accent-primary-muted) px-2 py-1 text-xs text-(--accent-primary) tabular-nums">
					{note.text.length} / {NOTE_MAX_LENGTH} зн.
				</div>
			</div>
		</div>
	);
});
