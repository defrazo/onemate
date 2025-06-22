import { forwardRef, useEffect, useState } from 'react';
import copy from 'copy-to-clipboard';
import { observer } from 'mobx-react-lite';

import { IconArrows, IconCopy } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/utils';
import { notifyStore } from '@/shared/stores';
import { Button, Textarea } from '@/shared/ui';

import { currencyStore } from '../model';
import { CurrencyBlock } from '.';

interface CurrencyWidgetProps {
	className?: string;
}

const Currency = forwardRef<HTMLDivElement, CurrencyWidgetProps>((props, ref) => {
	const [baseCurrencyValue, setBaseCurrencyValue] = useState<number>(1);
	const [targetCurrencyValue, setTargetCurrencyValue] = useState<number>();
	const [baseCurrency, setBaseCurrency] = useState<string>('USD');
	const [targetCurrency, setTargetCurrency] = useState<string>('RUB');
	const [currencyView, setCurrencyView] = useState<string>('');

	const swapCurrencies = (): void => {
		setBaseCurrency(targetCurrency);
		setTargetCurrency(baseCurrency);
	};

	const convertCurrency = (amount: number, from: string, to: string): number => {
		const fromRate = currencyStore.ratesList[from]?.value || 1;
		const toRate = currencyStore.ratesList[to]?.value || 1;

		return Number(((amount * fromRate) / toRate).toFixed(2));
	};

	const handleBaseCurrencyValueChange = (value: number) => {
		setBaseCurrencyValue(value);
		const converted = convertCurrency(value, baseCurrency, targetCurrency);
		setTargetCurrencyValue(converted);
	};

	const handleTargetCurrencyValueChange = (value: number) => {
		setTargetCurrencyValue(value);
		const converted = convertCurrency(value, targetCurrency, baseCurrency);
		setBaseCurrencyValue(converted);
	};

	const currencyOptions = Object.values(currencyStore.ratesList).map((item) => ({
		icon: item.icon,
		key: item.name,
		label: item.code,
		value: item.code,
	}));

	const selectCurrencies = (selected: string, type: 'base' | 'target'): void => {
		const [current, other, setCurrent, setOther] =
			type === 'base'
				? [baseCurrency, targetCurrency, setBaseCurrency, setTargetCurrency]
				: [targetCurrency, baseCurrency, setTargetCurrency, setBaseCurrency];

		if (selected === other) setOther(current);

		setCurrent(selected);
	};

	useEffect(() => {
		const converted = convertCurrency(baseCurrencyValue, baseCurrency, targetCurrency);
		setTargetCurrencyValue(converted);
	}, [baseCurrency, targetCurrency]);

	useEffect(() => {
		const baseRate = currencyStore.ratesList[baseCurrency]?.value;
		const targetRate = currencyStore.ratesList[targetCurrency]?.value;

		if (!baseRate || !targetRate) {
			setCurrencyView('Пожалуйста, выберите обе валюты');
			setTargetCurrencyValue(undefined);
			return;
		}

		const singleValue = (targetRate / baseRate).toFixed(4);
		const totalValue = (baseCurrencyValue * +singleValue).toFixed(2);

		setTargetCurrencyValue(+totalValue);

		const baseName = currencyStore.ratesList[baseCurrency]?.name || baseCurrency;
		const targetName = currencyStore.ratesList[targetCurrency]?.name || targetCurrency;

		const viewText =
			`1 ${baseName} = ${singleValue} ${targetName}\n` +
			`${baseCurrencyValue} ${baseName} = ${totalValue} ${targetName}`;

		setCurrencyView(viewText);
	}, [baseCurrency, targetCurrency, baseCurrencyValue, currencyStore.ratesList]);

	const handleCopy = () => {
		copy(currencyView);
		notifyStore.setSuccess('✅ Данные скопированы!');
	};

	return (
		<div
			ref={ref}
			{...props}
			className={cn(
				'core-card core-base flex w-full flex-1 flex-col gap-2 shadow-[var(--shadow)]',
				props.className
			)}
		>
			<span className="core-header">Конвертер валют</span>
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
					onClick={() => handleCopy()}
				/>
			</div>
			<div className="flex gap-2">
				<div className="relative flex w-full flex-col gap-2">
					<CurrencyBlock
						currencyOption={baseCurrency}
						currencyValue={baseCurrencyValue}
						options={currencyOptions}
						onChangeCurrency={(value) => selectCurrencies(value, 'base')}
						onChangeCurrencyValue={handleBaseCurrencyValueChange}
					/>
					<Button
						centerIcon={<IconArrows className="size-5" />}
						className="core-base absolute top-1/2 left-4 size-10 -translate-y-1/2"
						variant="custom"
						onClick={swapCurrencies}
					/>
					<CurrencyBlock
						currencyOption={targetCurrency}
						currencyValue={targetCurrencyValue}
						options={currencyOptions}
						onChangeCurrency={(value) => selectCurrencies(value, 'target')}
						onChangeCurrencyValue={handleTargetCurrencyValueChange}
					/>
				</div>
			</div>
		</div>
	);
});

export default observer(Currency);
