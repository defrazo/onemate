import { useEffect, useState } from 'react';
import { IconPlugConnected, IconPlugConnectedX } from '@tabler/icons-react';
import axios from 'axios';

import { useStore } from '@/app/providers';
import { useResponsive } from '@/shared/lib/hooks';
import { Button, ConfirmDialog, LoadingState, NoContent } from '@/shared/ui';

import { disconnectApp, getApps } from '../../../api';
import type { ConnectedApp } from '../../../model';

export const ConnectedAppsSection = () => {
	const { isMobile } = useResponsive();

	const { modalStore, notifyStore } = useStore();

	const [apps, setApps] = useState<ConnectedApp[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

	const handleClose = () => (isMobile ? modalStore.goBack() : modalStore.closeModal());

	const handleDisconnect = (app: ConnectedApp) => {
		const isCloud = app.account_type === 'cloud';
		let isSubmitting = false;

		const dialog = (
			<ConfirmDialog
				confirmLabel={isCloud ? 'Удалить аккаунт' : 'Отключить'}
				description={
					isCloud
						? `Аккаунт ${app.name} и все его данные будут удалены без возможности восстановления.`
						: `Связь с ${app.name} будет удалена. Аккаунт ToolBox и все данные сохранятся.`
				}
				title={isCloud ? `Удалить аккаунт ${app.name}?` : `Отключить ${app.name}?`}
				variant="danger"
				onCancel={handleClose}
				onConfirm={async () => {
					if (isSubmitting) return;

					isSubmitting = true;
					setDisconnectingId(app.id);

					try {
						await disconnectApp(app.id, app.account_type);

						setApps((prev) => prev.filter(({ id }) => id !== app.id));
						handleClose();
						notifyStore.setNotice(
							isCloud ? `Аккаунт ${app.name} удалён` : `${app.name} отключён`,
							'success'
						);
					} catch (error) {
						if (axios.isAxiosError(error) && error.response?.status === 409) {
							handleClose();

							try {
								const { apps } = await getApps();
								setApps(apps);
							} catch {
								notifyStore.setNotice('Не удалось обновить', 'error');
								return;
							}

							notifyStore.setNotice('Данные изменились. Повторите действие', 'error');
							return;
						}

						notifyStore.setNotice(
							axios.isAxiosError(error)
								? error.response?.data?.message || 'Не удалось отключить'
								: 'Не удалось отключить',
							'error'
						);
					} finally {
						isSubmitting = false;
						setDisconnectingId(null);
					}
				}}
			/>
		);

		isMobile ? modalStore.pushModal(dialog) : modalStore.setModal(dialog);
	};

	useEffect(() => {
		let active = true;

		const load = async () => {
			try {
				const { apps } = await getApps();
				if (active) setApps(apps);
			} catch {
				if (active) notifyStore.setNotice('Ошибка загрузки', 'error');
			} finally {
				if (active) setIsLoading(false);
			}
		};

		void load();

		return () => {
			active = false;
		};
	}, [notifyStore]);

	if (isLoading) return <LoadingState className="min-h-15" />;

	return (
		<section className="flex flex-col gap-2 select-none">
			<p className="text-sm text-(--text-secondary) opacity-70">Управление приложениями, связанными с OneMate</p>
			{apps.length === 0 ? (
				<NoContent
					description="Подключённые приложения появятся здесь"
					icon={IconPlugConnectedX}
					title="Нет связанных приложений"
				/>
			) : (
				<div className="flex flex-col gap-2">
					{apps.map((app) => (
						<div key={app.id} className="flex items-center gap-2">
							<div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-(--status-success-muted)">
								<IconPlugConnected className="size-5 text-(--status-success)" />
							</div>
							<div className="flex min-w-0 flex-1 flex-col">
								<span className="text-sm font-medium">{app.name}</span>
								<span className="-mt-0.5 truncate text-xs text-(--text-secondary) opacity-70">
									{app.description}
								</span>
							</div>
							<Button
								className="h-8 shrink-0"
								disabled={disconnectingId !== null}
								variant="danger"
								onClick={() => handleDisconnect(app)}
							>
								Отключить
							</Button>
						</div>
					))}
				</div>
			)}
		</section>
	);
};
