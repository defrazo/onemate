import { useState } from 'react';

import { cn } from '@/shared/lib/utils';
import { Button, Input } from '@/shared/ui';

import { TODO_LIMITS } from '../model';

export const LIST_COLORS = {
	slate: 'Серый',
	rose: 'Розовый',
	amber: 'Янтарный',
	emerald: 'Изумрудный',
	violet: 'Фиолетовый',
	lime: 'Лаймовый',
	fuchsia: 'Фуксия',
	sky: 'Голубой',
};

interface ListDialogProps {
	title: string;
	initialTitle?: string;
	initialColor?: string;
	maxLength?: number;
	withColor?: boolean;
	onSubmit: (title: string, color: string) => Promise<boolean>;
	onClose: () => void;
}

export const ListDialog = ({
	title,
	initialTitle = '',
	initialColor = 'slate',
	maxLength = TODO_LIMITS.LIST_TITLE,
	withColor = true,
	onSubmit,
	onClose,
}: ListDialogProps) => {
	const [name, setName] = useState(initialTitle);
	const [color, setColor] = useState(initialColor);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	return (
		<form
			className="flex w-[min(80vw,360px)] flex-col gap-4"
			onSubmit={async (event) => {
				event.preventDefault();
				if (saving) return;
				if (!name.trim()) {
					setError('Введите название');
					return;
				}
				setSaving(true);
				setError(null);
				try {
					if (await onSubmit(name.trim(), color)) onClose();
					else setError('Не удалось сохранить. Попробуйте ещё раз.');
				} finally {
					setSaving(false);
				}
			}}
		>
			<h2 className="text-lg font-bold">{title}</h2>
			<label className="flex flex-col gap-2 text-sm">
				Название
				<Input
					autoFocus
					disabled={saving}
					maxLength={maxLength}
					value={name}
					onChange={(event) => setName(event.target.value)}
				/>
			</label>
			{withColor && (
				<fieldset className="rounded-lg border border-(--border-primary) bg-(--tone) p-3" disabled={saving}>
					<legend className="px-1 text-sm text-(--text-secondary)">Цвет</legend>
					<div className="flex flex-wrap gap-2">
						{Object.entries(LIST_COLORS).map(([key, label]) => (
							<button
								key={key}
								aria-label={label}
								aria-pressed={color === key}
								className={cn(
									'size-7 cursor-pointer rounded-full border-2 border-transparent p-0.5 transition-transform hover:scale-110',
									color === key && 'border-(--text-primary)'
								)}
								title={label}
								type="button"
								onClick={() => setColor(key)}
							>
								<span
									className="block size-full rounded-full"
									style={{ backgroundColor: `var(--palette-${key})` }}
								/>
							</button>
						))}
					</div>
				</fieldset>
			)}
			{error && (
				<p className="text-sm text-(--status-error)" role="alert">
					{error}
				</p>
			)}
			<div className="flex justify-end gap-2">
				<Button loading={saving} type="submit" variant="accent">
					Сохранить
				</Button>
				<Button disabled={saving} onClick={onClose}>
					Отмена
				</Button>
			</div>
		</form>
	);
};
