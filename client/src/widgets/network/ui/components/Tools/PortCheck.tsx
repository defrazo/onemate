import { useState } from 'react';
import { IconArrowLeft, IconPlugConnected } from '@tabler/icons-react';

import { Button, Input } from '@/shared/ui';

import { checkPort } from '../../../api';
import type { PortCheckResult } from '../../../model';

export const PortCheck = ({ onBack }: { onBack: () => void }) => {
	const [host, setHost] = useState('');
	const [port, setPort] = useState('');
	const [result, setResult] = useState<PortCheckResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();

		const portNumber = Number(port);

		if (!host.trim() || !Number.isInteger(portNumber) || portNumber < 1 || portNumber > 65535 || isLoading) {
			return;
		}

		setIsLoading(true);
		setError(null);
		setResult(null);

		try {
			const response = await checkPort(host.trim(), portNumber);

			setResult(response);
		} catch (error) {
			setError(error instanceof Error ? error.message : 'Не удалось проверить порт.');
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
					<IconPlugConnected className="size-4 text-(--accent-default)" />
					<span className="text-sm">Проверка порта</span>
				</div>
			</div>
			<form className="flex flex-1 flex-col justify-center gap-3" onSubmit={handleSubmit}>
				<div className="grid grid-cols-[1fr_120px] gap-2">
					<Input
						name="host"
						placeholder="example.com"
						value={host}
						onChange={(event) => setHost(event.target.value)}
					/>
					<Input
						max="65535"
						min="1"
						name="port"
						placeholder="443"
						type="number"
						value={port}
						onChange={(event) => setPort(event.target.value)}
					/>
				</div>
				<Button disabled={!host.trim() || !port || isLoading} type="submit" variant="accent">
					{isLoading ? 'Проверяем...' : 'Проверить'}
				</Button>
				{result && (
					<div className="mt-2 flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<span
								className={`size-2 rounded-full ${
									result.status === 'open' ? 'bg-green-500' : 'bg-red-500'
								}`}
							/>
							<span className="text-sm">{result.status === 'open' ? 'Порт открыт' : 'Порт закрыт'}</span>
						</div>
						<div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
							<span className="text-(--color-secondary)">Адрес</span>
							<span>{result.host}</span>
							<span className="text-(--color-secondary)">Порт</span>
							<span>{result.port}</span>
							{result.responseTime !== null && (
								<>
									<span className="text-(--color-secondary)">Ответ</span>
									<span>{result.responseTime} мс</span>
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
