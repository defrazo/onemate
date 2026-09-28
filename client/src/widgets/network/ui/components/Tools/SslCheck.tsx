import { useState } from 'react';
import { IconAlertCircle, IconCertificate, IconLink, IconWorld, IconX } from '@tabler/icons-react';

import { useStore } from '@/app/providers';
import { useCopy } from '@/shared/lib/hooks';
import { Button, Input, InputLabel } from '@/shared/ui';

import { getDaysRemaining, sslResultToCopy } from '../../../lib';
import type { SslCheckResult } from '../../../model';
import { CopyButton, Metric, StatusDot, ViewHeader } from '..';

export const SslCheck = ({ onBack }: { onBack: () => void }) => {
	const copy = useCopy();

	const { networkStore, notifyStore } = useStore();

	const [host, setHost] = useState('');
	const [result, setResult] = useState<SslCheckResult | null>(null);

	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const statusLabel = result?.status === 'valid' ? 'Действителен' : 'Недействителен';

	const handleHostChange = (value: string) => {
		setHost(value);
		setResult(null);
		setError(null);
	};

	const handleCopy = () => {
		if (!result) return;
		copy(sslResultToCopy(result), 'Результат скопирован');
	};

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		const trimmedHost = host.trim();

		if (!trimmedHost || isLoading) return;

		setIsLoading(true);
		setError(null);

		try {
			setResult(await networkStore.checkSsl(trimmedHost));
		} catch (error) {
			error instanceof Error ? setError(error.message) : notifyStore.setNotice('Что-то пошло не так', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex h-full min-h-0 flex-col gap-2">
			<ViewHeader icon={IconCertificate} title="Проверка SSL" onBack={onBack} />
			<form className="flex flex-col gap-2" onSubmit={handleSubmit}>
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
						disabled={!host.trim() || isLoading}
						loading={isLoading}
						loadingText="Проверяем..."
						size="custom"
						title="Проверить SSL"
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
							<StatusDot status={result.status === 'valid' ? 'up' : 'down'} />
							<span className="max-w-64 min-w-0 truncate">{result.host}</span>
						</div>
						<span className="flex items-center gap-1 text-(--color-secondary)">
							<IconWorld className="size-3 shrink-0" />
							<span className="text-xs tabular-nums">{result.ip}</span>
						</span>
					</div>
					<div className="my-3 grid shrink-0 grid-cols-2 gap-y-3 rounded-xl bg-white/5 py-2.5 xl:grid-cols-4 xl:gap-y-0">
						<Metric
							label="Статус"
							style={result.status === 'valid' ? 'text-(--status-success)' : 'text-(--status-error)'}
							value={statusLabel}
						/>
						<Metric label="Издатель" value={result.issuer ?? '–'} />
						<Metric
							label="Истекает"
							value={result.validTo ? new Date(result.validTo).toLocaleDateString('ru-RU') : '–'}
						/>
						<Metric
							label="Осталось"
							style={getDaysRemaining(result.daysRemaining)}
							value={result.daysRemaining !== null ? `${result.daysRemaining} дн.` : '–'}
						/>
					</div>
				</div>
			)}
		</div>
	);
};
