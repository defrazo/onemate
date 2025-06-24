import { Input, SelectExt } from '@/shared/ui';

import { currStore } from '../model';

interface CurrencyBlockProps {
	currencyOption: string;
	currencyValue: number;
	onChangeCurrency: (value: string) => void;
	onChangeCurrencyValue: (value: number) => void;
}

export const CurrencyBlock = ({
	currencyOption,
	currencyValue,
	onChangeCurrency,
	onChangeCurrencyValue,
}: CurrencyBlockProps) => {
	return (
		<div className="core-border flex w-full rounded-xl p-1">
			<div className="flex-1">
				<Input
					className="border-none text-right"
					size="md"
					type="number"
					value={currencyValue}
					variant="custom"
					onChange={(e) => onChangeCurrencyValue(Number(e.target.value))}
				/>
			</div>
			<div className="shrink">
				<SelectExt
					className="w-30"
					options={currStore.currencyOptions}
					placeholder="Выберите валюту"
					value={currencyOption}
					onChange={(value) => onChangeCurrency(value)}
				/>
			</div>
		</div>
	);
};
