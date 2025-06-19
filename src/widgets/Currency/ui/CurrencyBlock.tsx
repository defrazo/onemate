import { Input, SelectExt } from '@/shared/ui';

interface CurrencyBlockProps {
	currencyValue?: number;
	currencyOption: string;
	onChangeCurrencyValue: (value: number) => void;
	onChangeCurrency: (value: string) => void;
	options: { value: string; label: string; icon: string }[];
}

export const CurrencyBlock = ({
	currencyValue,
	currencyOption,
	onChangeCurrencyValue,
	onChangeCurrency,
	options,
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
					options={options}
					placeholder="Выберите валюту"
					value={currencyOption}
					onChange={(value) => onChangeCurrency(value)}
				/>
			</div>
		</div>
	);
};
