import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Input, Select } from '@/shared/ui';

import { MAX_VALUE } from '../../model/constants';

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
		<div className="core-tone flex items-center rounded-lg border border-(--border-contrast)/15 p-1">
			<div className="flex-1">
				<Input
					className="number-no-spinner border-none bg-transparent px-4 text-right focus-visible:ring-0"
					enterKeyHint="done"
					inputMode="decimal"
					max={MAX_VALUE}
					min="0"
					name={`currency-${currency.code}`}
					type="text"
					value={input}
					onBlur={() => {
						setIsEditing(false);

						const number = Number(input.replace(',', '.'));

						if (!Number.isFinite(number) || number <= 0) {
							setInput('1');
							currencyStore.setCurrencyValue(idx, 1);
						} else setInput(String(number));
					}}
					onChange={(e) => {
						const value = e.target.value;

						if (!/^\d*(?:[.,]\d*)?$/.test(value)) return;

						const number = Number(value.replace(',', '.'));

						setInput(value);

						if (!Number.isFinite(number)) return;

						if (number > MAX_VALUE) {
							setInput(String(MAX_VALUE));
							currencyStore.setCurrencyValue(idx, MAX_VALUE);
							notifyStore.setNotice('Максимум 9 999 999', 'info');
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
					keyBadge
					align="start"
					className="w-30 hover:border-transparent focus:border-transparent"
					listPlacement="end"
					listWidth={240}
					options={currencyStore.currencyOptions}
					placeholder="Выберите валюту"
					selectedLabel="value"
					value={currency.code}
					variant="tone"
					onChange={(value) => currencyStore.selectCurrency(value, side)}
				/>
			</div>
		</div>
	);
});
