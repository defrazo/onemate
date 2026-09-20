import { useState } from 'react';
import { IconArrowLeft, IconCertificate } from '@tabler/icons-react';

import { Button, Input } from '@/shared/ui';

import { checkSsl } from '../../../api';
import type { SslCheckResult } from '../../../model';

export const SslCheck = ({ onBack }: { onBack: () => void }) => {
	const [host, setHost] = useState('');
	const [result, setResult] = useState<SslCheckResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!host.trim() || isLoading) {
			return;
		}

		setIsLoading(true);
		setError(null);
		setResult(null);

		try {
			const response = await checkSsl(host.trim());

			setResult(response);
		} catch (error) {
			setError(error instanceof Error ? error.message : 'Не удалось проверить SSL-сертификат.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="flex items-center gap-2">
				<Button
					centerIcon={<IconArrowLeft className="size-4" />}
					size="custom"
					title="Назад"
					variant="mobile"
					onClick={onBack}
				/>
				<div className="flex items-center gap-2">
					<IconCertificate className="size-4 text-(--accent-default)" />
					<span className="text-sm">Проверка SSL</span>
				</div>
			</div>
			<form className="flex flex-1 flex-col justify-center gap-3" onSubmit={handleSubmit}>
				<Input
					name="host"
					placeholder="example.com"
					value={host}
					onChange={(event) => setHost(event.target.value)}
				/>
				<Button disabled={!host.trim() || isLoading} type="submit" variant="accent">
					{isLoading ? 'Проверяем...' : 'Проверить'}
				</Button>
				{result && (
					<div className="mt-2 flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<span
								className={`size-2 rounded-full ${
									result.status === 'valid' ? 'bg-green-500' : 'bg-red-500'
								}`}
							/>
							<span className="text-sm">
								{result.status === 'valid' ? 'Сертификат действителен' : 'Сертификат недействителен'}
							</span>
						</div>
						<div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
							{result.issuer && (
								<>
									<span className="text-(--color-secondary)">Выдан</span>
									<span>{result.issuer}</span>
								</>
							)}
							{result.validTo && (
								<>
									<span className="text-(--color-secondary)">Истекает</span>
									<span>{new Date(result.validTo).toLocaleDateString('ru-RU')}</span>
								</>
							)}
							{result.daysRemaining !== null && (
								<>
									<span className="text-(--color-secondary)">Осталось</span>
									<span>{result.daysRemaining} дн.</span>
								</>
							)}
							<span className="text-(--color-secondary)">IP</span>
							<span>{result.ip}</span>
						</div>
					</div>
				)}
				{error && <p className="text-xs text-red-500">{error}</p>}
			</form>
		</div>
	);
};
