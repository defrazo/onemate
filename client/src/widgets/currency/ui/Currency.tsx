import { useCallback, useEffect, useState } from 'react';
import { IconCalculator } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useCopy } from '@/shared/lib/hooks';
import { Button, LoadingError, Tooltip } from '@/shared/ui';

import type { SummatorState } from '../model/types';
import { Controls, ConversionField, ExchangeRate, Summator } from './components';

export const Currency = observer(() => {
	const copy = useCopy();

	const { currencyStore } = useStore();

	const [summator, setSummator] = useState<SummatorState | null>(null);
	const [summatorOpen, setSummatorOpen] = useState(false);

	const openSummator = () => {
		setSummator(
			(current) =>
				current ?? {
					rows: [currencyStore.baseCode, currencyStore.targetCode].map((code) => ({
						id: crypto.randomUUID(),
						code,
						amount: '',
					})),
					target: currencyStore.targetCode,
				}
		);
		setSummatorOpen(true);
	};

	const handleLoad = useCallback(() => void currencyStore.ensureLoaded(), [currencyStore]);

	useEffect(() => handleLoad(), [handleLoad]);

	if (!currencyStore.isReady) return <LoadingError error={!!currencyStore.error} size="lg" onRetry={handleLoad} />;

	if (summatorOpen && summator)
		return <Summator value={summator} onBack={() => setSummatorOpen(false)} onChange={setSummator} />;

	return (
		<>
			<div className="flex shrink-0 justify-end">
				<Tooltip content="Сумматор валют">
					<Button
						centerIcon={<IconCalculator className="size-4" />}
						className="size-6 rounded-md"
						padding="none"
						title="Сумматор валют"
						variant="iconSurface"
						onClick={openSummator}
					/>
				</Tooltip>
			</div>
			<div
				className="m-auto w-full min-w-0 cursor-copy text-center text-2xl font-medium wrap-anywhere transition-colors hover:text-(--accent-primary) lg:text-3xl 2xl:text-4xl"
				title="Скопировать результат обмена"
				onClick={() => copy(currencyStore.conversionResult, 'Результат обмена скопирован')}
			>
				{currencyStore.conversionResult}
			</div>
			<div className="relative flex flex-col gap-2">
				<ConversionField side="base" />
				<Controls />
				<ConversionField side="target" />
			</div>
			<ExchangeRate />
		</>
	);
});
