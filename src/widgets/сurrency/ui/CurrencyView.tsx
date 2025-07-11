import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { IconCopy } from '@/shared/assets/icons';
import { copyExt } from '@/shared/lib/utils';
import { Button, Textarea } from '@/shared/ui';

import { currencyStore } from '../model';

export const CurrencyView = observer(() => {
	const [currencyView, setCurrencyView] = useState<string>('');
	const store = currencyStore;

	useEffect(() => {
		const baseRate = store.ratesList[store.baseCode]?.value;
		const targetRate = store.ratesList[store.targetCode]?.value;

		if (!baseRate || !targetRate) {
			setCurrencyView('Пожалуйста, выберите обе валюты');
			store.updateCurrencies(1, 'value', 0);
			return;
		}

		const singleValue = (targetRate / baseRate).toFixed(2);
		const totalValue = (store.baseValue * +singleValue).toFixed(2);

		store.updateCurrencies(1, 'value', +totalValue);

		const baseName = store.ratesList[store.baseCode]?.name || store.baseCode;
		const targetName = store.ratesList[store.targetCode]?.name || store.targetCode;

		const viewText =
			`1 ${baseName} = ${singleValue} ${targetName}\n` +
			`${store.baseValue} ${baseName} = ${totalValue} ${targetName}`;

		setCurrencyView(viewText);
	}, [store.baseCode, store.targetCode, store.baseValue, store.ratesList]);

	return (
		<div className="relative flex flex-1">
			<Textarea
				className="pointer-events-none grow cursor-default"
				placeholder="Пожалуйста, выберите обе валюты"
				readOnly
				value={currencyView}
				variant="ghost"
			/>
			<Button
				centerIcon={<IconCopy className="size-5" />}
				className="absolute right-0 bottom-0 bg-transparent p-2 opacity-20 transition hover:bg-transparent hover:opacity-100 active:bg-transparent"
				size="custom"
				title="Скопировать"
				variant="mobile"
				onClick={() => copyExt(currencyView)}
			/>
		</div>
	);
});
