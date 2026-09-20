import { useState } from 'react';
import { IconArrowLeft, IconTrash } from '@tabler/icons-react';

import { Button, Input } from '@/shared/ui';

import { type MonitoredService, NetworkStore } from '../../../model';

interface ResourceSettingsProps {
	store: NetworkStore;
	resource: MonitoredService;
	onBack: () => void;
	onDeleted: () => void;
}

export const ResourceSettings = ({ store, resource, onBack, onDeleted }: ResourceSettingsProps) => {
	const [name, setName] = useState(resource.name);
	const [url, setUrl] = useState(resource.url);
	const [isActive, setIsActive] = useState(resource.isActive);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const hasChanges = name.trim() !== resource.name || url.trim() !== resource.url || isActive !== resource.isActive;

	const save = async () => {
		if (!hasChanges || isSaving) {
			return;
		}

		setError(null);
		setIsSaving(true);

		try {
			await store.updateService(resource.id, {
				name: name.trim(),
				url: url.trim(),
				isActive,
			});

			onBack();
		} catch (error) {
			setError(error instanceof Error ? error.message : 'Не удалось сохранить настройки.');
		} finally {
			setIsSaving(false);
		}
	};

	const remove = async () => {
		if (isDeleting) {
			return;
		}

		setError(null);
		setIsDeleting(true);

		try {
			await store.deleteService(resource.id);
			onDeleted();
		} catch (error) {
			setError(error instanceof Error ? error.message : 'Не удалось удалить ресурс.');
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="flex h-full min-h-0 flex-col gap-3">
			<div className="flex shrink-0 items-center border-b border-(--border-color) pb-2">
				<Button
					className="rounded-lg bg-white/5 px-2 py-1 text-xs text-(--color-secondary) hover:bg-white/6"
					leftIcon={<IconArrowLeft className="size-4" />}
					size="sm"
					title="Вернуться"
					variant="mobile"
					onClick={onBack}
				>
					Назад
				</Button>
			</div>
			<div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
				<div className="flex flex-col gap-1">
					<span className="text-xs text-(--color-secondary)">Название</span>
					<Input maxLength={100} value={name} onChange={(event) => setName(event.target.value)} />
				</div>
				<div className="flex flex-col gap-1">
					<span className="text-xs text-(--color-secondary)">Адрес</span>
					<Input value={url} onChange={(event) => setUrl(event.target.value)} />
				</div>
				<div className="core-border flex items-center justify-between gap-4 bg-(--bg-secondary) px-3 py-2">
					<div className="flex min-w-0 flex-col">
						<span className="text-sm text-(--color-primary)">Мониторинг</span>
						<span className="text-xs text-(--color-secondary)">
							Автоматическая проверка каждые 15 минут
						</span>
					</div>
					<button
						aria-checked={isActive}
						className={[
							'relative h-6 w-11 shrink-0 rounded-full transition',
							isActive ? 'bg-(--accent-default)' : 'bg-white/10',
						].join(' ')}
						role="switch"
						type="button"
						onClick={() => setIsActive((value) => !value)}
					>
						<span
							className={[
								'absolute top-1 size-4 rounded-full bg-white transition-transform',
								isActive ? 'translate-x-1' : '-translate-x-4',
							].join(' ')}
						/>
					</button>
				</div>
				{error && <span className="text-xs text-(--status-error)">{error}</span>}
				<Button
					disabled={!hasChanges || isSaving || name.trim() === '' || url.trim() === ''}
					loading={isSaving}
					onClick={save}
				>
					Сохранить
				</Button>
				<div className="mt-auto border-t border-(--border-color) pt-3">
					<Button
						className="text-(--status-error)"
						disabled={isDeleting}
						leftIcon={<IconTrash className="size-4" />}
						variant="mobile"
						onClick={remove}
					>
						Удалить ресурс
					</Button>
				</div>
			</div>
		</div>
	);
};
