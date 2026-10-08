import { useState } from 'react';
import { IconAlertCircle, IconCertificate, IconLink, IconServer, IconX } from '@tabler/icons-react';

import { useStore } from '@/app/providers';
import { useCopy } from '@/shared/lib/hooks';
import { Button, Divider, Input, InputLabel } from '@/shared/ui';

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
		if (isLoading) return;

		const trimmedHost = host.trim();

		if (!trimmedHost) {
			notifyStore.setNotice('Не указан хост', 'error');
			return;
		}

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
		<div className="core-gap flex h-full min-h-0 flex-col">
			<ViewHeader icon={IconCertificate} title="Проверка SSL" onBack={onBack} />
			<form className="core-gap flex flex-col" onSubmit={handleSubmit}>
				<Input
					autoComplete="url"
					id="host"
					inputMode="url"
					leftIcon={<InputLabel htmlFor="host" icon={IconLink} />}
					placeholder="https://example.com"
					rightIcon={
						host && (
							<IconX
								className="mr-1 ml-1.5 size-5 cursor-pointer text-(--text-secondary) opacity-50 transition-[color,opacity] hover:text-(--accent-primary) hover:opacity-100"
								onClick={() => handleHostChange('')}
							/>
						)
					}
					type="text"
					value={host}
					variant="ghost"
					onChange={(e) => handleHostChange(e.target.value)}
				/>
				<div className="flex flex-wrap items-center justify-end gap-2">
					{result && <CopyButton onClick={handleCopy} />}
					{error && (
						<div className="flex flex-1 items-center gap-1 text-xs text-(--status-error)">
							<IconAlertCircle className="size-3.5" />
							<span>{error}</span>
						</div>
					)}
					<Button
						className="h-7 min-w-36 text-sm"
						disabled={isLoading}
						loading={isLoading}
						loadingText="Проверяем..."
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
						<span className="text-xs text-(--text-secondary)">Результат</span>
						<Divider />
					</div>
					<div className="flex flex-col gap-0.5">
						<div className="flex min-w-0 items-center gap-1">
							<StatusDot status={result.status === 'valid' ? 'up' : 'down'} />
							<span className="max-w-64 min-w-0 truncate">{result.host}</span>
						</div>
						<div className="flex items-center gap-1 text-(--text-secondary)">
							<IconServer className="size-3 shrink-0" />
							<span className="text-xs tabular-nums">{result.ip}</span>
						</div>
					</div>
					<div className="my-3 grid shrink-0 grid-cols-2 gap-y-3 rounded-lg bg-(--tone-strong) py-2.5 xl:grid-cols-4 xl:gap-y-0">
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
