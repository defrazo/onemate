import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Input, Select } from '@/shared/ui';

import { MAX_VALUE } from '../../model';

export const ConversionField = observer(({ side }: { side: 'base' | 'target' }) => {
	const { currencyStore, notifyStore } = useStore();

	const idx = side === 'base' ? 0 : 1;
	const currency = currencyStore.currencies[idx];

	const [input, setInput] = useState(String(currency.value));
	const [isEditing, setIsEditing] = useState(false);

	useEffect(() => {
		if (!isEditing) setInput(String(currency.value));
	}, [currency.value, isEditing]);

	return (
		<div className="core-tone flex items-center rounded-lg p-1">
			<div className="flex-1">
				<Input
					className="number-no-spinner border-none bg-transparent px-4 text-right focus-visible:ring-0"
					inputMode="decimal"
					max={MAX_VALUE}
					min="0"
					name={`currency-${currency.code}`}
					type="number"
					value={input}
					onBlur={() => {
						setIsEditing(false);

						if (input.trim() === '' || Number(input) <= 0) {
							setInput('1');
							currencyStore.setCurrencyValue(idx, 1);
						}
					}}
					onChange={(e) => {
						const value = e.target.value;
						const number = Number(value);

						setInput(value);

						if (Number.isNaN(number)) return;

						if (number > MAX_VALUE) {
							setInput(String(MAX_VALUE));
							currencyStore.setCurrencyValue(idx, MAX_VALUE);
							notifyStore.setNotice('9 999 999 – максимум', 'info');
							return;
						}

						currencyStore.setCurrencyValue(idx, number);
					}}
					onFocus={(e) => {
						setIsEditing(true);
						e.currentTarget.select();
					}}
				/>
			</div>
			<div className="shrink-0">
				<Select
					align="start"
					className="w-30 hover:border-transparent focus:border-transparent"
					direction="up"
					listClassName="-right-1 mb-2 left-auto w-60"
					options={currencyStore.currencyOptions}
					placeholder="Выберите валюту"
					value={currency.code}
					variant="tone"
					onChange={(value) => currencyStore.selectCurrency(value, side)}
				/>
			</div>
		</div>
	);
});
