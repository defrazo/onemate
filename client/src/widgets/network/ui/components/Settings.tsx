import { useState } from 'react';
import { IconLink, IconPlugConnected, IconServer, IconWorldWww, IconX } from '@tabler/icons-react';

import { useStore } from '@/app/providers';
import { Button, ConfirmDialog, Input, InputLabel, Switch } from '@/shared/ui';

import type { MonitoredService, UpdateMonitoredService } from '../../model';
import { ViewHeader } from '.';

interface SettingsProps {
	service: MonitoredService;
	onBack: () => void;
	onDeleted: () => void;
}

export const Settings = ({ service, onBack, onDeleted }: SettingsProps) => {
	const { modalStore, networkStore, notifyStore } = useStore();

	const [name, setName] = useState(service.name);
	const [url, setUrl] = useState(service.type === 'http' ? service.url : '');
	const [host, setHost] = useState(service.type === 'tcp' ? service.host : '');
	const [port, setPort] = useState(service.type === 'tcp' ? String(service.port) : '');

	const [isActive, setIsActive] = useState(service.isActive);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const portNumber = Number(port);

	const targetChanged =
		service.type === 'http'
			? url.trim() !== service.url
			: host.trim() !== service.host || portNumber !== service.port;

	const hasChanges = name.trim() !== service.name || targetChanged || isActive !== service.isActive;

	const isValid =
		name.trim() !== '' &&
		(service.type === 'http'
			? url.trim() !== ''
			: host.trim() !== '' && Number.isInteger(portNumber) && portNumber >= 1 && portNumber <= 65535);

	const update = async () => {
		setIsSaving(true);

		try {
			const data: UpdateMonitoredService =
				service.type === 'http'
					? { type: 'http', name: name.trim(), url: url.trim(), isActive }
					: { type: 'tcp', name: name.trim(), host: host.trim(), port: portNumber, isActive };

			await networkStore.updateService(service.id, data);

			modalStore.closeModal();
			onBack();
			notifyStore.setNotice('Настройки сохранены', 'success');
		} catch {
			notifyStore.setNotice('Что-то пошло не так', 'error');
		} finally {
			setIsSaving(false);
		}
	};

	const destroy = async () => {
		setIsDeleting(true);

		try {
			await networkStore.deleteService(service.id);

			modalStore.closeModal();
			onDeleted();
			notifyStore.setNotice('Сервис удалён', 'success');
		} catch {
			notifyStore.setNotice('Что-то пошло не так', 'error');
		} finally {
			setIsDeleting(false);
		}
	};

	const save = () => {
		if (!hasChanges || !isValid || isSaving || isDeleting) return;

		if (!targetChanged) {
			void update();
			return;
		}

		modalStore.setModal(
			<ConfirmDialog
				confirmLabel="Изменить"
				description="История предыдущих проверок будет удалена"
				title={service.type === 'http' ? 'Изменить адрес сервиса?' : 'Изменить сервер или порт?'}
				variant="danger"
				onCancel={() => modalStore.closeModal()}
				onConfirm={update}
			/>
		);
	};

	const remove = () => {
		if (isSaving || isDeleting) return;

		modalStore.setModal(
			<ConfirmDialog
				confirmLabel="Удалить"
				description="Сервис и вся история его проверок будут удалены. Это действие нельзя отменить."
				title="Удалить сервис?"
				variant="danger"
				onCancel={() => modalStore.closeModal()}
				onConfirm={destroy}
			/>
		);
	};

	return (
		<div className="flex h-full min-h-0 flex-col gap-2">
			<ViewHeader icon={IconWorldWww} title="Настройки мониторинга" onBack={onBack} />
			<div className="flex flex-col gap-3">
				<div className="flex flex-col gap-1">
					<label className="text-(--color-secondary) opacity-70" htmlFor="name">
						Название
					</label>
					<Input
						autoComplete="off"
						id="name"
						leftIcon={<InputLabel htmlFor="name" icon={IconWorldWww} />}
						maxLength={100}
						placeholder="Название сервиса"
						rightIcon={
							name && (
								<IconX
									className="mr-1 ml-1.5 size-5 cursor-pointer text-(--color-secondary) opacity-50 transition-[color,opacity] hover:text-(--accent-default) hover:opacity-100"
									onClick={() => setName('')}
								/>
							)
						}
						type="text"
						value={name}
						variant="ghost"
						onChange={(event) => setName(event.target.value)}
					/>
				</div>
				{service.type === 'http' ? (
					<div className="flex flex-col gap-1">
						<label className="text-(--color-secondary) opacity-70" htmlFor="url">
							Адрес
						</label>
						<Input
							autoComplete="url"
							id="url"
							inputMode="url"
							leftIcon={<InputLabel htmlFor="url" icon={IconLink} />}
							placeholder="https://example.com"
							rightIcon={
								url && (
									<IconX
										className="mr-1 ml-1.5 size-5 cursor-pointer text-(--color-secondary) opacity-50 transition-[color,opacity] hover:text-(--accent-default) hover:opacity-100"
										onClick={() => setUrl('')}
									/>
								)
							}
							type="text"
							value={url}
							variant="ghost"
							onChange={(event) => setUrl(event.target.value)}
						/>
					</div>
				) : (
					<div className="flex flex-col gap-1">
						<label className="text-(--color-secondary) opacity-70" htmlFor="host">
							Хост и порт
						</label>
						<div className="grid grid-cols-[minmax(0,1fr)_120px] gap-2">
							<Input
								autoComplete="url"
								id="host"
								leftIcon={<InputLabel htmlFor="host" icon={IconServer} />}
								placeholder="94.232.42.121"
								rightIcon={
									host && (
										<IconX
											className="mr-1 ml-1.5 size-5 cursor-pointer text-(--color-secondary) opacity-50 transition-[color,opacity] hover:text-(--accent-default) hover:opacity-100"
											onClick={() => setHost('')}
										/>
									)
								}
								type="text"
								value={host}
								variant="ghost"
								onChange={(event) => setHost(event.target.value)}
							/>
							<Input
								autoComplete="off"
								id="port"
								leftIcon={<InputLabel htmlFor="port" icon={IconPlugConnected} />}
								max="65535"
								min="1"
								placeholder="22"
								type="number"
								value={port}
								variant="ghost"
								onChange={(event) => setPort(event.target.value)}
							/>
						</div>
					</div>
				)}
				<div className="flex items-center justify-between">
					<div className="flex min-w-0 flex-col">
						<span className="text-sm xl:text-base">Мониторинг</span>
						<span className="text-xs text-(--color-secondary) opacity-70">
							Автоматическая проверка каждые 15 минут
						</span>
					</div>
					<Switch checked={isActive} onCheckedChange={setIsActive} />
				</div>
				<div className="ml-auto flex h-7 gap-3">
					<Button
						className="w-40 rounded-lg text-sm"
						disabled={!hasChanges || !isValid || isSaving || isDeleting}
						loading={isSaving}
						loadingText="Сохраняем..."
						size="custom"
						title="Сохранить"
						type="button"
						variant="accent"
						onClick={save}
					>
						<span className="trim">Сохранить</span>
					</Button>
					<Button
						className="w-40 rounded-lg text-sm"
						disabled={isSaving || isDeleting}
						loading={isDeleting}
						loadingText="Удаляем..."
						size="custom"
						title="Удалить"
						type="button"
						variant="warning"
						onClick={remove}
					>
						<span className="trim">Удалить</span>
					</Button>
				</div>
			</div>
		</div>
	);
};
