import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Input, SelectExt } from '@/shared/ui';

import type { CurrencyOption } from '../model';

interface CurrencyBlockProps {
	currency: string;
	currencyValue: number;
	options: CurrencyOption[];
	onChangeCurrency: (value: string) => void;
	onChangeValue: (value: number) => void;
}

const MAX_VALUE = 9999999;

export const CurrencyBlock = observer(
	({ currency, currencyValue, options, onChangeCurrency, onChangeValue }: CurrencyBlockProps) => {
		const { notifyStore } = useStore();

		const [input, setInput] = useState<string>(String(currencyValue));
		const [isEditing, setIsEditing] = useState<boolean>(false);

		useEffect(() => {
			if (!isEditing) setInput(String(currencyValue));
		}, [currencyValue, isEditing]);

		return (
			<div className="core-border flex w-full p-2">
				<div className="flex-1">
					<Input
						className="border-none text-right"
						inputMode="decimal"
						min="0"
						name={`currency-${currency}`}
						size="md"
						type="number"
						value={input}
						variant="custom"
						onBlur={() => {
							setIsEditing(false);
							if (input.trim() === '' || input === '0' || input.startsWith('00')) {
								setInput(String(currencyValue));
								onChangeValue(1);
							}
						}}
						onChange={(e) => {
							const val = e.target.value;
							setInput(val);

							const num = Number(val);

							if (!isNaN(num) && num <= MAX_VALUE) onChangeValue(num);
							else if (num > MAX_VALUE) {
								setInput(String(MAX_VALUE));
								onChangeValue(MAX_VALUE);
								notifyStore.setNotice('9 999 999 - максимум', 'info');
							}
						}}
						onFocus={() => {
							setIsEditing(true);
							setInput('');
						}}
					/>
				</div>
				<div className="shrink">
					<SelectExt
						addStyle="-mr-2 my-2"
						className="w-30 rounded-none border-l border-(--border-color)"
						direction="up"
						options={options}
						placeholder="Выберите валюту"
						value={currency}
						variant="detached"
						onChange={(value) => onChangeCurrency(value)}
					/>
				</div>
			</div>
		);
	}
);
