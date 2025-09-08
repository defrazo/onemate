import { useEffect, useState } from 'react';

import { useStore } from '@/app/providers';
import { formatFixed } from '@/shared/lib/utils';

export const useCurrency = () => {
	const { currencyStore: store } = useStore();

	const [exchangeRate, setExchangeRate] = useState<string>('');
	const [exchangeResult, setExchangeResult] = useState<string>('');

	useEffect(() => {
		const baseRate = store.ratesList[store.baseCode]?.value ?? 0;
		const targetRate = store.ratesList[store.targetCode]?.value ?? 0;
		const ratio = baseRate > 0 ? targetRate / baseRate : 0;

		const baseName = store.ratesList[store.baseCode]?.name || store.baseCode;
		const targetName = store.ratesList[store.targetCode]?.name || store.targetCode;

		setExchangeRate(`1 ${baseName} = ${formatFixed(ratio, 2)} ${targetName}`);
		setExchangeResult(
			`${formatFixed(store.baseValue, 2)} ${store.baseCode} = ${formatFixed(store.targetValue, 2)} ${store.targetCode}`
		);
	}, [store.baseCode, store.targetCode, store.baseValue, store.targetValue, store.ratesList]);

	return { exchangeRate, exchangeResult };
};
