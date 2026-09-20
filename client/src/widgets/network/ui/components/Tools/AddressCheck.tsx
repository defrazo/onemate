import type { FormEvent } from 'react';
import { useState } from 'react';
import { IconArrowLeft, IconWorldCheck } from '@tabler/icons-react';

import { Button, Input } from '@/shared/ui';

import { checkAddress } from '../../../api';
import type { AddressCheckResult } from '../../../model';

export const AddressCheck = ({ onBack }: { onBack: () => void }) => {
	const [url, setUrl] = useState('');
	const [result, setResult] = useState<AddressCheckResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!url.trim() || isLoading) {
			return;
		}

		setIsLoading(true);
		setError(null);
		setResult(null);

		try {
			const response = await checkAddress(url.trim());

			setResult(response);
		} catch (error) {
			setError(error instanceof Error ? error.message : 'Не удалось проверить адрес.');
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
					<IconWorldCheck className="size-4 text-(--accent-default)" />
					<span className="text-sm">Проверка адреса</span>
				</div>
			</div>
			<form className="flex flex-1 flex-col justify-center gap-3" onSubmit={handleSubmit}>
				<Input
					name="address"
					placeholder="https://example.com"
					type="url"
					value={url}
					onChange={(event) => setUrl(event.target.value)}
				/>
				<Button disabled={!url.trim() || isLoading} type="submit" variant="accent">
					{isLoading ? 'Проверяем...' : 'Проверить'}
				</Button>
				{result && (
					<div className="mt-2 flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<span
								className={`size-2 rounded-full ${
									result.status === 'up' ? 'bg-green-500' : 'bg-red-500'
								}`}
							/>
							<span className="text-sm">{result.status === 'up' ? 'Доступен' : 'Недоступен'}</span>
						</div>
						<div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
							{result.statusCode !== null && (
								<>
									<span className="text-(--color-secondary)">HTTP</span>
									<span>{result.statusCode}</span>
								</>
							)}
							{result.responseTime !== null && (
								<>
									<span className="text-(--color-secondary)">Ответ</span>
									<span>{result.responseTime} мс</span>
								</>
							)}
							{result.ip && (
								<>
									<span className="text-(--color-secondary)">IP</span>
									<span>{result.ip}</span>
								</>
							)}
						</div>
					</div>
				)}
				{error && <p className="text-xs text-red-500">{error}</p>}
			</form>
		</div>
	);
};
