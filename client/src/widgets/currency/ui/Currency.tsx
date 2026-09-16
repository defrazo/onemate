import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useCopy } from '@/shared/lib/hooks';
import { LoadingError } from '@/shared/ui';

import { Controls, ConversionField, ExchangeRate } from './components';

export const Currency = observer(() => {
	const copy = useCopy();

	const { currencyStore } = useStore();

	return (
		<>
			{!currencyStore.isReady ? (
				<LoadingError size="lg" onRetry={() => currencyStore.init()} />
			) : (
				<>
					<div
						className="m-auto cursor-copy text-2xl hover:text-(--accent-default) xl:text-3xl 2xl:text-4xl"
						title="Скопировать курс обмена"
						onClick={() => copy(currencyStore.conversionResult, 'Результат обмена скопирован!')}
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
			)}
		</>
	);
});
