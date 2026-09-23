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
import { cn } from '@/shared/lib/utils';
import { Button, Input, InputLabel, Tooltip } from '@/shared/ui';

import type { MonitoringType } from '../../model';
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

	const isValid =
		name.trim() !== '' &&
		(type === 'http'
			? url.trim() !== ''
			: host.trim() !== '' && Number.isInteger(portNumber) && portNumber >= 1 && portNumber <= 65535);

	const checkTypes = [
		{ value: 'http', label: 'Сайт' },
		{ value: 'tcp', label: 'Сервер / Порт' },
	] satisfies { value: MonitoringType; label: string }[];

	const handleTypeChange = (nextType: MonitoringType) => {
		setType(nextType);
		setError(null);
	};

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!isValid || isLoading) return;

		setError(null);
		setIsLoading(true);

		try {
			if (type === 'http') await networkStore.addService({ type: 'http', name: name.trim(), url: url.trim() });
			else await networkStore.addService({ type: 'tcp', name: name.trim(), host: host.trim(), port: portNumber });

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
					<label className="text-(--color-secondary) opacity-70" htmlFor="name">
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
				<div className="flex flex-wrap items-center justify-between">
					<span className="text-(--color-secondary) opacity-70">Тип проверки</span>
					<div className="grid w-64 grid-cols-2 rounded-lg bg-(--bg-tertiary) p-0.5">
						{checkTypes.map(({ value, label }) => {
							const isActive = type === value;

							return (
								<button
									key={value}
									className={cn(
										'h-6 min-w-30 cursor-pointer rounded-md px-4 text-sm transition-colors',
										isActive
											? 'bg-(--accent-default) text-(--color-primary)'
											: 'text-(--color-secondary) hover:text-(--accent-default)'
									)}
									type="button"
									onClick={() => handleTypeChange(value)}
								>
									<span className="trim">{label}</span>
								</button>
							);
						})}
					</div>
				</div>
				{type === 'http' ? (
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
							onChange={(event) => {
								setUrl(event.target.value);
								setError(null);
							}}
						/>
					</div>
				) : (
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-1.5 text-(--color-secondary) opacity-70">
							<label htmlFor="host">Хост и порт</label>
							<Tooltip content={tip}>
								<IconLifebuoy className="size-4" />
							</Tooltip>
						</div>

						<div className="grid grid-cols-[minmax(0,1fr)_120px] gap-2">
							<Input
								autoComplete="url"
								id="host"
								leftIcon={<InputLabel htmlFor="host" icon={IconLink} />}
								placeholder="94.232.42.121"
								rightIcon={
									host && (
										<IconX
											className="mr-1 ml-1.5 size-5 cursor-pointer text-(--color-secondary) opacity-50 transition-[color,opacity] hover:text-(--accent-default) hover:opacity-100"
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
								onChange={(event) => {
									setHost(event.target.value);
									setError(null);
								}}
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
								onChange={(event) => {
									setPort(event.target.value);
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
					className="ml-auto h-7 rounded-lg px-3 text-sm"
					disabled={!isValid || isLoading}
					loading={isLoading}
					loadingText="Добавляем..."
					size="custom"
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
				<span className="font-medium">22</span> – SSH, доступность сервера
			</li>
			<li>
				<span className="font-medium">80</span> – HTTP
			</li>
			<li>
				<span className="font-medium">443</span> – HTTPS
			</li>
			<li>
				<span className="font-medium">3000, 8000, 8080</span> – часто используются в вебе
			</li>
		</ul>
	</div>
);
