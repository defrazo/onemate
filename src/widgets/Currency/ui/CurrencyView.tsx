import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { IconCopy } from '@/shared/assets/icons';
import { useCopy } from '@/shared/lib/hooks';
import { Button, Textarea } from '@/shared/ui';

import { currStore } from '../model';

export const CurrencyView = observer(() => {
	const [currencyView, setCurrencyView] = useState<string>('');

	useEffect(() => {
		const baseRate = currStore.ratesList[currStore.baseCode]?.value;
		const targetRate = currStore.ratesList[currStore.targetCode]?.value;

		if (!baseRate || !targetRate) {
			setCurrencyView('Пожалуйста, выберите обе валюты');
			currStore.updateCurrencies(1, 'value', 0);
			return;
		}

		const singleValue = (targetRate / baseRate).toFixed(2);
		const totalValue = (currStore.baseValue * +singleValue).toFixed(2);

		currStore.updateCurrencies(1, 'value', +totalValue);

		const baseName = currStore.ratesList[currStore.baseCode]?.name || currStore.baseCode;
		const targetName = currStore.ratesList[currStore.targetCode]?.name || currStore.targetCode;

		const viewText =
			`1 ${baseName} = ${singleValue} ${targetName}\n` +
			`${currStore.baseValue} ${baseName} = ${totalValue} ${targetName}`;

		setCurrencyView(viewText);
	}, [currStore.baseCode, currStore.targetCode, currStore.baseValue, currStore.ratesList]);

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
				title="Скопировать в буфер"
				variant="mobile"
				onClick={() => useCopy(currencyView)}
			/>
		</div>
	);
});
