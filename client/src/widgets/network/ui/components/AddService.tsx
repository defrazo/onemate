import { useState } from 'react';
import {
	IconAlertCircle,
	IconLifebuoy,
	IconLink,
	IconPlugConnected,
	IconServer,
	IconWorldWww,
	IconX,
} from '@tabler/icons-react';

import { useStore } from '@/app/providers';
import { Button, Input, InputLabel, LengthHint, SegmentedControl, Tooltip } from '@/shared/ui';

import { LIMITS, type MonitoringType } from '../../model';
import { ViewHeader } from '.';

export const AddService = ({ onBack, onCreated }: { onBack: () => void; onCreated: () => void }) => {
	const { networkStore, notifyStore } = useStore();

	const [type, setType] = useState<MonitoringType>('http');
	const [name, setName] = useState('');
	const [url, setUrl] = useState('');
	const [host, setHost] = useState('');
	const [port, setPort] = useState('');

	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const portNumber = Number(port);

	const handleTypeChange = (nextType: MonitoringType) => {
		setType(nextType);
		setError(null);
	};

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (isLoading) return;

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

		if (type === 'http' && !trimmedUrl) {
			notifyStore.setNotice('Укажите адрес сервиса', 'error');
			return;
		}

		if (type === 'tcp') {
			if (!trimmedHost) {
				notifyStore.setNotice('Укажите хост', 'error');
				return;
			}

			if (!port.trim()) {
				notifyStore.setNotice('Укажите порт', 'error');
				return;
			}

			if (!Number.isInteger(portNumber) || portNumber < LIMITS.MIN_PORT || portNumber > LIMITS.MAX_PORT) {
				notifyStore.setNotice(`Порт — от ${LIMITS.MIN_PORT} до ${LIMITS.MAX_PORT}`, 'error');
				return;
			}
		}

		setError(null);
		setIsLoading(true);

		try {
			if (type === 'http') await networkStore.addService({ type: 'http', name: trimmedName, url: trimmedUrl });
			else await networkStore.addService({ type: 'tcp', name: trimmedName, host: trimmedHost, port: portNumber });

			onCreated();
			notifyStore.setNotice('Сервис успешно добавлен', 'success');
		} catch (error) {
			error instanceof Error ? setError(error.message) : notifyStore.setNotice('Что-то пошло не так', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex h-full min-h-0 flex-col gap-2">
			<ViewHeader icon={IconServer} title="Добавить сервис" onBack={onBack} />
			<form className="flex flex-col gap-3" onSubmit={handleSubmit}>
				<div className="flex flex-col gap-1">
					<label className="text-(--text-secondary) opacity-70" htmlFor="name">
						Название
					</label>
					<Input
						autoComplete="off"
						id="name"
						leftIcon={<InputLabel htmlFor="name" icon={IconWorldWww} />}
						placeholder="Название сервиса"
						rightIcon={
							name && (
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
				<div className="flex flex-wrap items-center justify-between gap-2">
					<span className="text-(--text-secondary) opacity-70">Тип проверки</span>
					<SegmentedControl
						className="w-64 not-lg:ml-auto"
						options={[
							{ value: 'http', label: 'Сайт' },
							{ value: 'tcp', label: 'Сервер / Порт' },
						]}
						value={type}
						onChange={handleTypeChange}
					/>
				</div>
				{type === 'http' ? (
					<div className="flex flex-col gap-1">
						<label className="text-(--text-secondary) opacity-70" htmlFor="url">
							Адрес
						</label>
						<Input
							autoComplete="url"
							id="url"
							inputMode="url"
							leftIcon={<InputLabel htmlFor="url" icon={IconLink} />}
							maxLength={LIMITS.URL}
							placeholder="https://example.com"
							rightIcon={
								url && (
									<IconX
										className="mr-1 ml-1.5 size-5 cursor-pointer text-(--text-secondary) opacity-50 transition-[color,opacity] hover:text-(--accent-primary) hover:opacity-100"
										onClick={() => {
											setUrl('');
											setError(null);
										}}
									/>
								)
							}
							type="text"
							value={url}
							variant="ghost"
							onChange={(e) => {
								setUrl(e.target.value);
								setError(null);
							}}
						/>
					</div>
				) : (
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-1.5 text-(--text-secondary) opacity-70">
							<label htmlFor="host">Хост и порт</label>
							<Tooltip content={tip}>
								<IconLifebuoy className="hidden size-4 xl:block" />
							</Tooltip>
						</div>
						<div className="grid grid-cols-[minmax(0,1fr)_120px] gap-2">
							<Input
								autoComplete="url"
								id="host"
								leftIcon={<InputLabel htmlFor="host" icon={IconLink} />}
								maxLength={LIMITS.HOST}
								placeholder="94.232.42.121"
								rightIcon={
									host && (
										<IconX
											className="mr-1 ml-1.5 size-5 cursor-pointer text-(--text-secondary) opacity-50 transition-[color,opacity] hover:text-(--accent-primary) hover:opacity-100"
											onClick={() => {
												setHost('');
												setError(null);
											}}
										/>
									)
								}
								type="text"
								value={host}
								variant="ghost"
								onChange={(e) => {
									setHost(e.target.value);
									setError(null);
								}}
							/>
							<Input
								autoComplete="off"
								className="number-no-spinner"
								id="port"
								leftIcon={<InputLabel htmlFor="port" icon={IconPlugConnected} />}
								max={LIMITS.MAX_PORT}
								min={LIMITS.MIN_PORT}
								placeholder="22"
								type="number"
								value={port}
								variant="ghost"
								onChange={(e) => {
									setPort(e.target.value);
									setError(null);
								}}
							/>
						</div>
					</div>
				)}
				{error && (
					<div className="flex items-start gap-1.5 px-1 text-xs text-(--status-error)">
						<IconAlertCircle className="mt-px size-3.5 shrink-0" />
						<span>{error}</span>
					</div>
				)}
				<Button
					className="h-9 min-w-36 text-sm md:ml-auto md:h-7"
					disabled={isLoading}
					loading={isLoading}
					loadingText="Добавляем..."
					title="Добавить"
					type="submit"
					variant="accent"
				>
					Добавить
				</Button>
			</form>
		</div>
	);
};

const tip = (
	<div className="space-y-2">
		<p>Какой порт указать?</p>
		<ul className="list-disc pl-4">
			<li>
				<span>22</span> – SSH, доступность сервера
			</li>
			<li>
				<span>80</span> – HTTP
			</li>
			<li>
				<span>443</span> – HTTPS
			</li>
			<li>
				<span>3000, 8000, 8080</span> – часто используются в вебе
			</li>
		</ul>
	</div>
);
