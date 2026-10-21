import { useState } from 'react';
import { IconAlertTriangle, IconCloudDownload, IconDeviceFloppy } from '@tabler/icons-react';

import { useStore } from '@/app/providers';
import { Button } from '@/shared/ui';

export const ConflictDialog = () => {
	const { cloudStore, modalStore, notifyStore } = useStore();

	const [isLoading, setIsLoading] = useState(false);

	const handleResolve = async (strategy: 'server' | 'local'): Promise<void> => {
		if (isLoading) return;

		setIsLoading(true);

		try {
			if (strategy === 'server') await cloudStore.acceptServerText();
			else await cloudStore.overwriteServerText();

			if (cloudStore.textConflict) return;

			notifyStore.setNotice(
				strategy === 'server' ? 'Серверная версия загружена' : 'Ваш текст сохранён',
				'success'
			);

			modalStore.closeModal();
		} catch {
			notifyStore.setNotice('Не удалось разрешить конфликт', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-3 select-none md:-mt-4 md:w-md">
			<div className="flex gap-2">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-amber-500/12">
					<IconAlertTriangle className="size-6 text-amber-500" />
				</div>
				<div className="flex h-full flex-col justify-between gap-0.5 select-none">
					<h2 className="-mt-0.5 text-lg font-semibold">Конфликт синхронизации</h2>
					<p className="trim text-xs text-(--text-secondary) opacity-60 md:text-sm">
						Текст изменён на другом устройстве
					</p>
				</div>
			</div>
			<div className="flex flex-col gap-2">
				<div className="flex gap-2 rounded-lg bg-(--tone) px-3 py-2">
					<IconCloudDownload className="mt-0.5 size-4.5 shrink-0 text-(--accent-primary)" />
					<div>
						<p className="text-sm font-medium">Загрузить с сервера</p>
						<p className="text-xs text-(--text-secondary) opacity-70">
							Заменить текущий текст последней сохранённой версией. Локальные изменения будут потеряны.
						</p>
					</div>
				</div>
				<div className="flex gap-2 rounded-lg bg-(--tone) px-3 py-2">
					<IconDeviceFloppy className="mt-0.5 size-4.5 shrink-0 text-(--accent-primary)" />
					<div>
						<p className="text-sm font-medium">Оставить мой текст</p>
						<p className="text-xs text-(--text-secondary) opacity-70">
							Сохранить текущий текст вместо серверной версии. Изменения другого устройства будут
							заменены.
						</p>
					</div>
				</div>
			</div>
			<div className="flex h-9 justify-center gap-3 md:h-7 md:justify-end">
				<Button
					className="not-md:flex-1 not-md:text-sm"
					disabled={isLoading}
					variant="danger"
					onClick={() => void handleResolve('server')}
				>
					Загрузить с сервера
				</Button>
				<Button
					className="not-md:flex-1 not-md:text-sm"
					disabled={isLoading}
					variant="accent"
					onClick={() => void handleResolve('local')}
				>
					Оставить мой текст
				</Button>
			</div>
		</div>
	);
};
