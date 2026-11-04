import { useState } from 'react';
import { IconLayoutGrid, IconListDetails, IconPalette } from '@tabler/icons-react';

import { useStore } from '@/app/providers';
import { COLOR_PALETTE } from '@/shared/config';
import { cn } from '@/shared/lib/utils';
import { Button, Input, Select } from '@/shared/ui';

interface ListDialogProps {
	title: string;
	mode?: 'list' | 'canvas';
	initialTitle?: string;
	initialColor?: string;
	maxLength: number;
	canvasId?: string;
	canvases?: { id: string; title: string; disabled?: boolean }[];
	onSubmit: (title: string, color: string, canvasId?: string) => Promise<boolean>;
	onClose: () => void;
}

export const ListDialog = ({
	title,
	mode,
	initialTitle = '',
	initialColor = 'slate',
	maxLength,
	canvasId,
	canvases = [],
	onSubmit,
	onClose,
}: ListDialogProps) => {
	const { notifyStore } = useStore();

	const [name, setName] = useState(initialTitle);
	const [color, setColor] = useState(initialColor);
	const [selectedCanvasId, setSelectedCanvasId] = useState(canvasId ?? '');
	const [saving, setSaving] = useState(false);

	const isList = mode === 'list';
	const Icon = isList ? IconListDetails : IconLayoutGrid;

	const length = name.trim().length;

	const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>): Promise<void> => {
		event.preventDefault();
		if (saving) return;

		const title = name.trim();

		if (!title) {
			notifyStore.setNotice('Введите название', 'info');
			return;
		}

		if (title.length > maxLength) {
			notifyStore.setNotice(`Не более ${maxLength} символов`, 'info');
			return;
		}

		setSaving(true);

		try {
			const success = await onSubmit(title, color, selectedCanvasId || undefined);

			if (success) onClose();
			else notifyStore.setNotice('Что-то пошло не так', 'error');
		} catch {
			notifyStore.setNotice('Что-то пошло не так', 'error');
		} finally {
			setSaving(false);
		}
	};

	return (
		<form className="core-gap flex flex-col select-none md:-mt-4 md:w-103.5" onSubmit={handleSubmit}>
			<div className="flex gap-2">
				<div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-(--accent-primary)/12 text-(--accent-primary)">
					<Icon className="size-5.5" />
				</div>
				<div className="flex h-full flex-col justify-between gap-0.5">
					<h2 className="text-lg font-semibold">{title}</h2>
					<p className="trim text-sm text-(--text-secondary) opacity-60">
						{isList ? 'Настройка списка' : 'Настройка холста'}
					</p>
				</div>
			</div>
			<div className="flex flex-col gap-1">
				<label className="text-sm text-(--text-secondary) opacity-70" htmlFor="todo-list-title">
					Название
				</label>
				<Input
					autoFocus
					disabled={saving}
					id="todo-list-title"
					placeholder="Введите название"
					value={name}
					onChange={(event) => setName(event.target.value)}
				/>
				<span
					className={cn(
						'ml-auto text-xs opacity-70',
						length > maxLength ? 'text-(--status-error)' : 'text-(--text-secondary)'
					)}
				>
					{length ? `${length} / ${maxLength} символов` : `До ${maxLength} символов`}
				</span>
			</div>
			{isList && (
				<div className="flex flex-col rounded-lg border border-(--border-primary) bg-(--tone)">
					<div className="group flex min-h-11 flex-wrap items-center gap-2 border-b border-(--border-primary) px-2 py-1.5 transition-colors hover:bg-(--tone-hover)">
						<span className="flex size-5 shrink-0 items-center justify-center text-(--text-disabled) transition-colors group-hover:text-(--accent-primary)">
							<IconPalette className="size-5" />
						</span>
						<span className="min-w-0 flex-1 text-sm text-(--text-secondary) transition-colors group-hover:text-(--text-primary)">
							Цвет
						</span>
						<div className="ml-auto flex shrink-0 items-center justify-end gap-1.5">
							{Object.entries(COLOR_PALETTE).map(([key, { label, value }]) => (
								<button
									key={key}
									aria-label={label}
									aria-pressed={color === key}
									className={cn(
										'relative size-5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-[transform,border-color] duration-150 hover:scale-110 hover:border-(--tone-strong-hover)',
										color === key && 'scale-110 border-(--tone-strong-hover)'
									)}
									disabled={saving}
									title={label}
									type="button"
									onClick={() => setColor(key)}
								>
									<span
										className="absolute inset-0.5 rounded-full"
										style={{ backgroundColor: value }}
									/>
								</button>
							))}
						</div>
					</div>
					{canvasId && canvases.length > 1 && (
						<div className="group flex min-h-11 flex-wrap items-center gap-2 px-2 py-1.5 transition-colors hover:bg-(--tone-hover)">
							<span className="flex size-5 shrink-0 items-center justify-center text-(--text-disabled) transition-colors group-hover:text-(--accent-primary)">
								<IconLayoutGrid className="size-5" />
							</span>
							<span className="min-w-0 flex-1 text-sm text-(--text-secondary) transition-colors group-hover:text-(--text-primary)">
								Холст
							</span>
							<div className="ml-auto w-40 shrink-0">
								<Select
									align="start"
									className="h-8.5 justify-center border border-(--tone-strong) text-sm"
									disabled={saving}
									options={canvases.map(({ id, title, disabled }) => ({
										value: id,
										label: title,
										disabled,
									}))}
									value={selectedCanvasId}
									variant="tone"
									onChange={setSelectedCanvasId}
								/>
							</div>
						</div>
					)}
				</div>
			)}
			<div className="flex h-9 justify-center gap-3 md:h-7 md:justify-end">
				<Button className="not-md:flex-1" loading={saving} type="submit" variant="accent">
					Сохранить
				</Button>
				<Button className="not-md:flex-1" disabled={saving} type="button" variant="danger" onClick={onClose}>
					Отмена
				</Button>
			</div>
		</form>
	);
};
