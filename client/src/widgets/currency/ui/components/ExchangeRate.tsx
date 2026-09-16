import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useCopy } from '@/shared/lib/hooks';

export const ExchangeRate = observer(() => {
	const copy = useCopy();

	const { currencyStore } = useStore();

	return (
		<div
			className="group/currency flex h-6 cursor-copy items-center justify-center gap-1 text-xs text-(--color-secondary) lg:gap-2 xl:text-base"
			title="Скопировать курс"
			onClick={() => copy(currencyStore.exchangeRate, 'Курс обмена скопирован!')}
		>
			<span className="trim">Курс:</span>
			<span className="trim group-hover/currency:text-(--accent-default)">{currencyStore.exchangeRate}</span>
		</div>
	);
});
