import { observer } from 'mobx-react-lite';

import { IconArrows } from '@/shared/assets/icons';
import { Button } from '@/shared/ui';

import type { CurrencyStore } from '../model';
import { CurrencyBlock } from '.';

interface CurrencyControlsProps {
	store: CurrencyStore;
}

export const CurrencyControls = observer(({ store }: CurrencyControlsProps) => {
	return (
		<div className="flex flex-col">
			<Button
				className="ml-auto text-sm text-[var(--color-disabled)] hover:text-[var(--accent-hover)]"
				disabled={store.isDefault}
				size="custom"
				variant="custom"
				onClick={() => store.clear()}
			>
				Сбросить
			</Button>
			<div className="relative flex w-full flex-col gap-2">
				<CurrencyBlock
					currency={store.baseCode}
					currencyValue={store.baseValue}
					options={store.currencyOptions}
					onChangeCurrency={(value) => store.selectCurrency(value, 'base')}
					onChangeValue={(value) => store.handleCurrencyValue(0, value)}
				/>
				<Button
					centerIcon={<IconArrows className="size-4" />}
					className="core-elements absolute top-1/2 left-4 size-8 -translate-y-1/2 rounded-full"
					title="Поменять местами валюты"
					onClick={() => store.swapCurrencies()}
				/>
				<CurrencyBlock
					currency={store.targetCode}
					currencyValue={store.targetValue}
					options={store.currencyOptions}
					onChangeCurrency={(value) => store.selectCurrency(value, 'target')}
					onChangeValue={(value) => store.handleCurrencyValue(1, value)}
				/>
			</div>
		</div>
	);
});
