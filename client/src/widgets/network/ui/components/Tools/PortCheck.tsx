import { useState } from 'react';
import { IconAlertCircle, IconLink, IconMobiledata, IconPlugConnected, IconWorld, IconX } from '@tabler/icons-react';

import { useStore } from '@/app/providers';
import { useCopy } from '@/shared/lib/hooks';
import { Button, Input, InputLabel } from '@/shared/ui';

import { getResponseTimeClass, portResultToCopy } from '../../../lib';
import type { PortCheckResult } from '../../../model';
import { CopyButton, Metric, StatusDot, ViewHeader } from '..';

export const PortCheck = ({ onBack }: { onBack: () => void }) => {
	const copy = useCopy();

	const { networkStore, notifyStore } = useStore();

	const [host, setHost] = useState('');
	const [port, setPort] = useState('');
	const [result, setResult] = useState<PortCheckResult | null>(null);

	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const portNumber = Number(port);
	const isValid = host.trim() !== '' && Number.isInteger(portNumber) && portNumber >= 1 && portNumber <= 65535;

	const statusLabel = result?.status === 'open' ? 'Порт открыт' : 'Порт закрыт';

	const handleHostChange = (value: string) => {
		setHost(value);
		setResult(null);
		setError(null);
	};

	const handlePortChange = (value: string) => {
		setPort(value);
		setResult(null);
		setError(null);
	};

	const handleCopy = () => {
		if (!result) return;
		copy(portResultToCopy(result), 'Результат скопирован!');
	};

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!isValid || isLoading) return;

		setIsLoading(true);
		setError(null);

		try {
			setResult(await networkStore.checkPort(host.trim(), Number(port)));
		} catch (error) {
			error instanceof Error ? setError(error.message) : notifyStore.setNotice('Что-то пошло не так', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex h-full min-h-0 flex-col gap-2">
			<ViewHeader icon={IconPlugConnected} title="Проверка порта" onBack={onBack} />
			<form className="flex flex-col gap-2" onSubmit={handleSubmit}>
				<div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_144px]">
					<Input
						autoComplete="url"
						id="host"
						inputMode="url"
						leftIcon={<InputLabel htmlFor="host" icon={IconLink} />}
						placeholder="https://example.com"
						rightIcon={
							host && (
								<IconX
									className="mr-1 ml-1.5 size-5 cursor-pointer text-(--color-secondary) opacity-50 transition-[color,opacity] hover:text-(--accent-default) hover:opacity-100"
									onClick={() => handleHostChange('')}
								/>
							)
						}
						type="text"
						value={host}
						variant="ghost"
						onChange={(event) => handleHostChange(event.target.value)}
					/>
					<Input
						autoComplete="off"
						id="port"
						leftIcon={<InputLabel htmlFor="port" icon={IconMobiledata} />}
						max="65535"
						min="1"
						placeholder="443"
						rightIcon={
							port && (
								<IconX
									className="mr-1 ml-1.5 size-5 cursor-pointer text-(--color-secondary) opacity-50 transition-[color,opacity] hover:text-(--accent-default) hover:opacity-100"
									onClick={() => handlePortChange('')}
								/>
							)
						}
						type="number"
						value={port}
						variant="ghost"
						onChange={(event) => handlePortChange(event.target.value)}
					/>
				</div>
				<div className="flex flex-wrap items-center justify-end gap-3">
					{result && <CopyButton onClick={handleCopy} />}
					{error && (
						<div className="flex flex-1 items-center gap-1 text-xs text-(--status-error)">
							<IconAlertCircle className="size-3.5" />
							<span>{error}</span>
						</div>
					)}
					<Button
						className="h-7 min-w-36 rounded-lg text-sm"
						disabled={!isValid || isLoading}
						loading={isLoading}
						loadingText="Проверяем..."
						size="custom"
						title="Проверить порт"
						type="submit"
						variant="accent"
					>
						Проверить
					</Button>
				</div>
			</form>
			{result && (
				<div className="flex flex-col">
					<div className="mb-3 flex items-center gap-2">
						<span className="text-xs text-(--color-secondary)">Результат</span>
						<div className="h-px flex-1 bg-(--border-color)" />
					</div>
					<div className="flex flex-col">
						<div className="flex min-w-0 items-center gap-1">
							<StatusDot status={result.status === 'open' ? 'up' : 'down'} />
							<span className="max-w-64 min-w-0 truncate">{result.host}</span>
						</div>
						<span className="flex items-center gap-1 text-(--color-secondary)">
							<IconWorld className="size-3 shrink-0" />
							<span className="text-xs tabular-nums">{result.ip}</span>
						</span>
					</div>
					<div className="my-3 grid shrink-0 grid-cols-3 rounded-xl bg-white/5 py-2.5">
						<Metric
							label="Отклик"
							style={getResponseTimeClass(result.responseTime)}
							value={result.responseTime !== null ? `${result.responseTime} мс` : '–'}
						/>
						<Metric
							label="Порт"
							style={result.status === 'open' ? 'text-(--status-success)' : 'text-(--status-error)'}
							value={String(result.port)}
						/>
						<Metric
							label="Статус"
							style={result.status === 'open' ? 'text-(--status-success)' : 'text-(--status-error)'}
							value={statusLabel}
						/>
					</div>
				</div>
			)}
		</div>
	);
};
