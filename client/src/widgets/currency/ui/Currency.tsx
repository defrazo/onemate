import { useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useCopy } from '@/shared/lib/hooks';
import { LoadingError } from '@/shared/ui';

import { Controls, ConversionField, ExchangeRate } from './components';

export const Currency = observer(() => {
	const copy = useCopy();

	const { currencyStore } = useStore();

	const handleLoad = useCallback(() => void currencyStore.ensureLoaded(), [currencyStore]);

	useEffect(() => handleLoad(), [handleLoad]);

	if (!currencyStore.isReady) return <LoadingError error={!!currencyStore.error} size="lg" onRetry={handleLoad} />;

	return (
		<>
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
