import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Input, SelectExt } from '@/shared/ui';

import { MAX_VALUE } from '../../model';

export const ConversionField = observer(({ side }: { side: 'base' | 'target' }) => {
	const { currencyStore, notifyStore } = useStore();

	const index = side === 'base' ? 0 : 1;
	const currency = currencyStore.currencies[index];

	const [input, setInput] = useState(String(currency.value));
	const [isEditing, setIsEditing] = useState(false);

	useEffect(() => {
		if (!isEditing) setInput(String(currency.value));
	}, [currency.value, isEditing]);

	return (
		<div className="core-border flex items-center p-1">
			<div className="flex-1">
				<Input
					className="border-none px-4 text-right"
					inputMode="decimal"
					max={MAX_VALUE}
					min="0"
					name={`currency-${currency.code}`}
					size="md"
					type="number"
					value={input}
					variant="custom"
					onBlur={() => {
						setIsEditing(false);

						if (input.trim() === '' || Number(input) <= 0) {
							setInput('1');
							currencyStore.setCurrencyValue(index, 1);
						}
					}}
					onChange={(e) => {
						const value = e.target.value;
						const number = Number(value);

						setInput(value);

						if (Number.isNaN(number)) return;

						if (number > MAX_VALUE) {
							setInput(String(MAX_VALUE));
							currencyStore.setCurrencyValue(index, MAX_VALUE);
							notifyStore.setNotice('9 999 999 – максимум', 'info');
							return;
						}

						currencyStore.setCurrencyValue(index, number);
					}}
					onFocus={(e) => {
						setIsEditing(true);
						e.currentTarget.select();
					}}
				/>
			</div>
			<div className="h-8 w-px bg-(--border-color)" />
			<div className="shrink-0">
				<SelectExt
					addStyle="-mr-2 my-2"
					className="w-30"
					direction="up"
					options={currencyStore.currencyOptions}
					placeholder="Выберите валюту"
					value={currency.code}
					variant="detached"
					onChange={(value) => currencyStore.selectCurrency(value, side)}
				/>
			</div>
		</div>
	);
});
