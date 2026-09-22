import { useState } from 'react';
import { IconAlertCircle, IconLink, IconWorld, IconWorldCheck, IconX } from '@tabler/icons-react';

import { useStore } from '@/app/providers';
import { useCopy } from '@/shared/lib/hooks';
import { Button, Input, InputLabel } from '@/shared/ui';

import { getResponseTimeClass, getStatusCodeClass, serviceResultToCopy } from '../../../lib';
import type { ServiceCheckResult } from '../../../model';
import { CopyButton, Metric, StatusDot, ViewHeader } from '..';

export const ServiceCheck = ({ onBack }: { onBack: () => void }) => {
	const copy = useCopy();

	const { networkStore, notifyStore } = useStore();

	const [url, setUrl] = useState('');
	const [result, setResult] = useState<ServiceCheckResult | null>(null);

	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const statusLabel = result?.status === 'up' ? 'Доступен' : 'Недоступен';

	const handleUrlChange = (value: string) => {
		setUrl(value);
		setResult(null);
		setError(null);
	};

	const handleCopy = () => {
		if (!result) return;
		copy(serviceResultToCopy(result), 'Результат скопирован!');
	};

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		const trimmedUrl = url.trim();
		if (!trimmedUrl || isLoading) return;

		setIsLoading(true);
		setError(null);

		try {
			setResult(await networkStore.checkService(trimmedUrl));
		} catch (error) {
			error instanceof Error ? setError(error.message) : notifyStore.setNotice('Что-то пошло не так', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex h-full min-h-0 flex-col gap-2">
			<ViewHeader icon={IconWorldCheck} title="Проверка сервиса" onBack={onBack} />
			<form className="flex flex-col gap-2" onSubmit={handleSubmit}>
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
								onClick={() => handleUrlChange('')}
							/>
						)
					}
					type="text"
					value={url}
					variant="ghost"
					onChange={(event) => handleUrlChange(event.target.value)}
				/>
				<div className="flex flex-wrap items-center justify-end gap-3">
					{result && <CopyButton onClick={handleCopy} />}
					{error && (
						<div className="flex flex-1 items-center gap-1 text-xs text-(--status-error)">
							<IconAlertCircle className="size-3.5" />
							<span>{error}</span>
						</div>
					)}
					<Button
						className="h-7 min-w-36 rounded-lg px-3 text-sm"
						disabled={!url.trim() || isLoading}
						loading={isLoading}
						loadingText="Проверяем..."
						size="custom"
						title="Проверить сервис"
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
							<StatusDot status={result.status} />
							<a
								className="block max-w-64 min-w-0 cursor-pointer truncate hover:text-(--accent-default)"
								href={result.url}
								rel="noopener noreferrer"
								target="_blank"
							>
								{result.url}
							</a>
						</div>
						{result.ip && (
							<span className="flex items-center gap-1 text-(--color-secondary)">
								<IconWorld className="size-3 shrink-0" />
								<span className="text-xs tabular-nums">{result.ip}</span>
							</span>
						)}
					</div>
					<div className="my-3 grid grid-cols-3 rounded-xl bg-white/5 py-2.5">
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
						<Metric label="Статус" style={getStatusCodeClass(result.statusCode)} value={statusLabel} />
					</div>
				</div>
			)}
		</div>
	);
};
