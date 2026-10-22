import { useState } from 'react';
import { IconLink, IconPlugConnected, IconServer, IconWorldWww, IconX } from '@tabler/icons-react';

import { useStore } from '@/app/providers';
import { Button, ConfirmDialog, Input, InputLabel, LengthHint, SegmentedControl, Switch } from '@/shared/ui';

import { type CheckVia, LIMITS, type MonitoredService, type UpdateMonitoredService } from '../../model';
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
	const [checkVia, setCheckVia] = useState<CheckVia>(service.checkVia);
	const [isActive, setIsActive] = useState(service.isActive);

	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const isBusy = isSaving || isDeleting;

	const portNumber = Number(port);

	const targetChanged =
		service.type === 'http'
			? url.trim() !== service.url
			: host.trim() !== service.host || portNumber !== service.port;

	const checkViaChanged = checkVia !== service.checkVia;

	const checkConfigChanged = targetChanged || checkViaChanged;

	const hasChanges = name.trim() !== service.name || checkConfigChanged || isActive !== service.isActive;

	const handleRouteChange = (nextType: CheckVia) => {
		setCheckVia(nextType);
	};

	const update = async () => {
		if (isBusy) return;

		setIsSaving(true);

		try {
			const data: UpdateMonitoredService =
				service.type === 'http'
					? { type: 'http', name: name.trim(), url: url.trim(), checkVia, isActive }
					: { type: 'tcp', name: name.trim(), host: host.trim(), port: portNumber, checkVia, isActive };

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
		if (isBusy) return;

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
		if (!hasChanges || isBusy) return;

		const trimmedName = name.trim();
		const trimmedUrl = url.trim();
		const trimmedHost = host.trim();

		if (!trimmedName) {
			notifyStore.setNotice('Укажите название сервиса', 'error');
			return;
		}

		if (trimmedName.length > LIMITS.SERVICE_NAME) {
			notifyStore.setNotice(`Максимум ${LIMITS.SERVICE_NAME} символов`, 'error');
			return;
		}

		if (service.type === 'http' && !trimmedUrl) {
			notifyStore.setNotice('Укажите адрес сервиса', 'error');
			return;
		}

		if (service.type === 'tcp') {
			if (!trimmedHost) {
				notifyStore.setNotice('Укажите хост', 'error');
				return;
			}

			if (!port.trim()) {
				notifyStore.setNotice('Укажите порт', 'error');
				return;
			}

			if (!Number.isInteger(portNumber) || portNumber < LIMITS.MIN_PORT || portNumber > LIMITS.MAX_PORT) {
				notifyStore.setNotice(`Порт – от ${LIMITS.MIN_PORT} до ${LIMITS.MAX_PORT}`, 'error');
				return;
			}
		}

		if (!checkConfigChanged) {
			void update();
			return;
		}

		modalStore.setModal(
			<ConfirmDialog
				confirmLabel="Изменить"
				description="История предыдущих проверок будет удалена"
				title="Изменить параметры проверки?"
				variant="danger"
				onCancel={() => modalStore.closeModal()}
				onConfirm={update}
			/>
		);
	};

	const remove = () => {
		if (isBusy) return;

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
					<label className="text-sm text-(--text-secondary) opacity-70" htmlFor="name">
						Название
					</label>
					<Input
						autoComplete="off"
						disabled={isBusy}
						id="name"
						leftIcon={<InputLabel htmlFor="name" icon={IconWorldWww} />}
						placeholder="Название сервиса"
						rightIcon={
							name &&
							!isBusy && (
								<IconX
									className="mr-1 ml-1.5 size-5 cursor-pointer text-(--text-secondary) opacity-50 transition-[color,opacity] hover:text-(--accent-primary) hover:opacity-100"
									onClick={() => setName('')}
								/>
							)
						}
						type="text"
						value={name}
						variant="ghost"
						onChange={(e) => setName(e.target.value)}
					/>
					<LengthHint max={LIMITS.SERVICE_NAME} value={name} />
				</div>
				{service.type === 'http' ? (
					<div className="flex flex-col gap-1">
						<label className="text-sm text-(--text-secondary) opacity-70" htmlFor="url">
							Адрес
						</label>
						<Input
							autoComplete="url"
							disabled={isBusy}
							id="url"
							inputMode="url"
							leftIcon={<InputLabel htmlFor="url" icon={IconLink} />}
							maxLength={LIMITS.URL}
							placeholder="https://example.com"
							rightIcon={
								url &&
								!isBusy && (
									<IconX
										className="mr-1 ml-1.5 size-5 cursor-pointer text-(--text-secondary) opacity-50 transition-[color,opacity] hover:text-(--accent-primary) hover:opacity-100"
										onClick={() => setUrl('')}
									/>
								)
							}
							type="text"
							value={url}
							variant="ghost"
							onChange={(e) => setUrl(e.target.value)}
						/>
					</div>
				) : (
					<div className="flex flex-col gap-1">
						<label className="text-sm text-(--text-secondary) opacity-70" htmlFor="host">
							Хост и порт
						</label>
						<div className="grid grid-cols-[minmax(0,1fr)_144px] gap-2">
							<Input
								autoComplete="url"
								disabled={isBusy}
								id="host"
								leftIcon={<InputLabel htmlFor="host" icon={IconServer} />}
								maxLength={LIMITS.HOST}
								placeholder="94.232.42.121"
								rightIcon={
									host &&
									!isBusy && (
										<IconX
											className="mr-1 ml-1.5 size-5 cursor-pointer text-(--text-secondary) opacity-50 transition-[color,opacity] hover:text-(--accent-primary) hover:opacity-100"
											onClick={() => setHost('')}
										/>
									)
								}
								type="text"
								value={host}
								variant="ghost"
								onChange={(e) => setHost(e.target.value)}
							/>
							<Input
								autoComplete="off"
								className="number-no-spinner"
								disabled={isBusy}
								id="port"
								leftIcon={<InputLabel htmlFor="port" icon={IconPlugConnected} />}
								max={LIMITS.MAX_PORT}
								min={LIMITS.MIN_PORT}
								placeholder="22"
								rightIcon={
									port &&
									!isBusy && (
										<IconX
											className="mr-1 ml-1.5 size-5 cursor-pointer text-(--text-secondary) opacity-50 transition-[color,opacity] hover:text-(--accent-primary) hover:opacity-100"
											onClick={() => setPort('')}
										/>
									)
								}
								type="number"
								value={port}
								variant="ghost"
								onChange={(e) => setPort(e.target.value)}
							/>
						</div>
					</div>
				)}
				<div className="flex items-center justify-between">
					<div className="flex min-w-0 flex-col gap-0.5">
						<span className="text-sm text-(--text-secondary) opacity-70">Мониторинг</span>
						<span className="trim text-xs text-(--text-disabled)">
							Автоматическая проверка каждые 15 минут
						</span>
					</div>
					<Switch checked={isActive} disabled={isBusy} onCheckedChange={setIsActive} />
				</div>
				<div className="flex flex-col gap-3">
					<div className="flex items-center justify-between gap-3">
						<span className="text-sm text-(--text-secondary) opacity-70">Маршрут проверки</span>
						<SegmentedControl
							className="h-7 min-w-36"
							disabled={isBusy}
							options={[
								{ value: 'direct', label: 'Direct' },
								{ value: 'proxy', label: 'Proxy' },
							]}
							value={checkVia}
							onChange={handleRouteChange}
						/>
					</div>
					<div className="mt-3 flex h-9 gap-3 md:h-7 lg:ml-auto">
						<Button
							className="min-w-36 text-sm not-lg:flex-1"
							disabled={!hasChanges || isBusy}
							loading={isSaving}
							loadingText="Сохраняем..."
							title="Сохранить"
							type="button"
							variant="accent"
							onClick={save}
						>
							<span className="trim">Сохранить</span>
						</Button>
						<Button
							className="min-w-36 text-sm not-lg:flex-1"
							disabled={isBusy}
							loading={isDeleting}
							loadingText="Удаляем..."
							title="Удалить"
							type="button"
							variant="danger"
							onClick={remove}
						>
							<span className="trim">Удалить</span>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};
