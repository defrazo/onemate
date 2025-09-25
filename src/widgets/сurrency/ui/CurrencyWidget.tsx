import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { WIDGET_TIPS } from '@/shared/content';
import { useCopy } from '@/shared/lib/hooks';
import { ErrorFallback, Tooltip } from '@/shared/ui';

import { useCurrency } from '../model';
import { CurrencyControls } from '.';

const CurrencyWidget = () => {
	const { currencyStore } = useStore();
	const copy = useCopy();
	const { exchangeRate, exchangeResult } = useCurrency();

	return (
		<>
			<div className="flex items-center">
				<Tooltip content={WIDGET_TIPS.currency}>
					<h1 className="core-header">Конвертер валют</h1>
				</Tooltip>
			</div>
			{!currencyStore.isReady ? (
				<ErrorFallback onRetry={() => currencyStore.init()} />
			) : (
				<>
					<div
						className="m-auto flex cursor-copy py-10 text-center text-2xl hover:text-[var(--accent-default)] xl:p-0 xl:text-3xl 2xl:text-4xl"
						title="Скопировать курс обмена"
						onClick={() => copy(exchangeResult, 'Курс обмена скопирован!')}
					>
						{exchangeResult}
					</div>
					<CurrencyControls store={currencyStore} />
					<div
						className="mx-auto flex h-9 cursor-copy items-end text-xs text-[var(--color-disabled)] hover:text-[var(--accent-default)] lg:text-sm xl:text-base"
						title="Скопировать результат обмена"
						onClick={() => copy(exchangeRate, 'Результат обмена скопирован!')}
					>
						{exchangeRate}
					</div>
				</>
			)}
		</>
	);
};

export default observer(CurrencyWidget);
