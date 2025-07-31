import { useEffect, useState } from 'react';

import { currencyStore } from '.';

export const useCurrency = () => {
	const store = currencyStore;

	const [exchangeRate, setExchangeRate] = useState<string>('');
	const [exchangeResult, setExchangeResult] = useState<string>('');

	useEffect(() => {
		const baseRate = store.ratesList[store.baseCode]?.value;
		const targetRate = store.ratesList[store.targetCode]?.value;

		const singleValue = (targetRate / baseRate).toFixed(2);
		const totalValue = (store.baseValue * +singleValue).toFixed(2);

		store.updateCurrencies(1, 'value', +totalValue);

		const baseName = store.ratesList[store.baseCode]?.name || store.baseCode;
		const targetName = store.ratesList[store.targetCode]?.name || store.targetCode;

		const exchangeRateText = `1 ${store.baseCode} = ${singleValue} ${store.targetCode}`;
		const exchangeResultText = `${store.baseValue} ${baseName} = ${totalValue} ${targetName}`;

		setExchangeRate(exchangeRateText);
		setExchangeResult(exchangeResultText);
	}, [store.baseCode, store.targetCode, store.baseValue, store.ratesList]);

	return { exchangeRate, exchangeResult };
};
