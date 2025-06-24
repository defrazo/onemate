import { observer } from 'mobx-react-lite';

import { IconArrows } from '@/shared/assets/icons';
import { Button } from '@/shared/ui';

import { currStore } from '../model';
import { CurrencyBlock } from '.';

export const CurrencyControls = observer(() => {
	return (
		<div className="flex gap-2">
			<div className="relative flex w-full flex-col gap-2">
				<CurrencyBlock
					currencyOption={currStore.baseCode}
					currencyValue={currStore.baseValue}
					onChangeCurrency={(value) => currStore.selectCurrency(value, 'base')}
					onChangeCurrencyValue={(value) => currStore.handleCurrencyValue(0, value)}
				/>
				<Button
					centerIcon={<IconArrows className="size-5" />}
					className="core-base absolute top-1/2 left-4 size-10 -translate-y-1/2"
					variant="custom"
					onClick={currStore.swapCurrencies}
				/>
				<CurrencyBlock
					currencyOption={currStore.targetCode}
					currencyValue={currStore.targetValue}
					onChangeCurrency={(value) => currStore.selectCurrency(value, 'target')}
					onChangeCurrencyValue={(value) => currStore.handleCurrencyValue(1, value)}
				/>
			</div>
		</div>
	);
});
