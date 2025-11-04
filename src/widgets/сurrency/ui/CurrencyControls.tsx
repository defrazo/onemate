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
				className="ml-auto bg-transparent text-xs text-(--color-disabled) hover:text-(--status-error) xl:text-sm"
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
					className="absolute top-1/2 left-4 -mt-4 size-8 rounded-full"
					title="Поменять местами валюты"
					variant="accent"
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
