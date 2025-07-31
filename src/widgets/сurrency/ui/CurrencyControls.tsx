import { observer } from 'mobx-react-lite';

import { IconArrows } from '@/shared/assets/icons';
import { Button } from '@/shared/ui';

import { currencyStore } from '../model';
import { CurrencyBlock } from '.';

export const CurrencyControls = observer(() => {
	return (
		<div className="flex gap-2">
			<div className="relative flex w-full flex-col gap-2">
				<CurrencyBlock
					currency={currencyStore.baseCode}
					currencyValue={currencyStore.baseValue}
					onChangeCurrency={(value) => currencyStore.selectCurrency(value, 'base')}
					onChangeValue={(value) => currencyStore.handleCurrencyValue(0, value)}
				/>
				<Button
					centerIcon={<IconArrows className="size-4" />}
					className="core-elements absolute top-1/2 left-4 size-8 -translate-y-1/2 rounded-full"
					title="Поменять местами валюты"
					onClick={currencyStore.swapCurrencies}
				/>
				<CurrencyBlock
					currency={currencyStore.targetCode}
					currencyValue={currencyStore.targetValue}
					onChangeCurrency={(value) => currencyStore.selectCurrency(value, 'target')}
					onChangeValue={(value) => currencyStore.handleCurrencyValue(1, value)}
				/>
			</div>
		</div>
	);
});
