import { useState } from 'react';
import { IconAlertCircle, IconLink, IconRoute, IconWorld, IconWorldCheck, IconX } from '@tabler/icons-react';

import { useStore } from '@/app/providers';
import { useCopy } from '@/shared/lib/hooks';
import { Divider, Input, InputLabel, SegmentedControl } from '@/shared/ui';

import {
	getCheckViaLabel,
	getResponseTimeClass,
	getServiceStatusClass,
	getStatusCodeClass,
	serviceResultToCopy,
} from '../../../lib';
import type { CheckVia, ServiceCheckResult } from '../../../model';
import { CopyButton, Metric, StatusDot, SubmitButton, ViewHeader } from '..';

export const ServiceCheck = ({ onBack }: { onBack: () => void }) => {
	const copy = useCopy();

	const { networkStore, notifyStore } = useStore();

	const [url, setUrl] = useState('');
	const [result, setResult] = useState<ServiceCheckResult | null>(null);
	const [checkVia, setCheckVia] = useState<CheckVia>('direct');

	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const statusLabel = result?.status === 'up' ? 'Доступен' : 'Недоступен';

	const handleUrlChange = (value: string) => {
		setUrl(value);
		setResult(null);
		setError(null);
	};

	const handleRouteChange = (nextType: CheckVia) => {
		setCheckVia(nextType);
		setResult(null);
		setError(null);
	};

	const handleCopy = () => {
		if (!result) return;
		copy(serviceResultToCopy(result), 'Результат скопирован');
	};

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (isLoading) return;

		const trimmedUrl = url.trim();

		if (!trimmedUrl) {
			notifyStore.setNotice('Не указан адрес сервиса', 'error');
			return;
		}

		setIsLoading(true);
		setResult(null);
		setError(null);

		try {
			setResult(await networkStore.checkService(trimmedUrl, checkVia));
		} catch (error) {
			error instanceof Error ? setError(error.message) : notifyStore.setNotice('Что-то пошло не так', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="core-gap flex h-full min-h-0 flex-col">
			<ViewHeader icon={IconWorldCheck} title="Проверка сервиса" onBack={onBack} />
			<form className="core-gap flex flex-col" onSubmit={handleSubmit}>
				<Input
					autoComplete="url"
					disabled={isLoading}
					id="url"
					inputMode="url"
					leftIcon={<InputLabel htmlFor="url" icon={IconLink} />}
					placeholder="https://example.com"
					rightIcon={
						url &&
						!isLoading && (
							<IconX
								className="mr-1 ml-1.5 size-5 cursor-pointer text-(--text-secondary) opacity-50 transition-[color,opacity] hover:text-(--accent-primary) hover:opacity-100"
								onClick={() => handleUrlChange('')}
							/>
						)
					}
					type="text"
					value={url}
					variant="ghost"
					onChange={(e) => handleUrlChange(e.target.value)}
				/>
				<div className="flex flex-wrap items-center justify-end gap-2">
					{error ? (
						<div className="flex flex-1 items-center gap-1 text-xs text-(--status-error)">
							<IconAlertCircle className="size-3.5" />
							<span>{error}</span>
						</div>
					) : (
						<SegmentedControl
							className="h-7 min-w-36 not-md:ml-auto md:mr-auto"
							disabled={isLoading}
							options={[
								{ value: 'direct', label: 'Direct' },
								{ value: 'proxy', label: 'Proxy' },
							]}
							value={checkVia}
							onChange={handleRouteChange}
						/>
					)}
					<SubmitButton isLoading={isLoading} title="Проверить сервис" />
				</div>
			</form>
			{result && (
				<div className="flex flex-col">
					<div className="flex items-center gap-2">
						<span className="text-xs text-(--text-secondary)">Результат</span>
						<Divider className="shrink" />
						<CopyButton onClick={handleCopy} />
					</div>
					<div className="flex flex-col gap-0.5">
						<div className="flex min-w-0 items-center gap-1">
							<StatusDot status={result.status} />
							<a
								className="block max-w-64 min-w-0 cursor-pointer truncate hover:text-(--accent-primary)"
								href={result.url}
								rel="noopener noreferrer"
								target="_blank"
							>
								{result.url}
							</a>
						</div>
						<div className="flex items-center gap-1 text-(--text-secondary)">
							{result.ip && (
								<>
									<IconWorld className="size-3 shrink-0" />
									<span className="text-xs tabular-nums">{result.ip}</span>
									<Divider className="my-auto h-2.5" direction="Y" margX="sm" />
								</>
							)}
							<IconRoute className="size-3 shrink-0" />
							<span className="text-xs">{getCheckViaLabel(result.checkVia)}</span>
						</div>
					</div>
					<div className="my-3 grid grid-cols-3 rounded-lg bg-(--tone-strong) py-1.5">
						<Metric
							label="Отклик"
							style={getResponseTimeClass(result.responseTime)}
							value={result.responseTime !== null ? `${result.responseTime} мс` : '–'}
						/>
						<Metric
							label="HTTP"
							style={getStatusCodeClass(result.statusCode)}
							value={result.statusCode !== null ? String(result.statusCode) : '–'}
						/>
						<Metric label="Статус" style={getServiceStatusClass(result.status)} value={statusLabel} />
					</div>
				</div>
			)}
		</div>
	);
};
